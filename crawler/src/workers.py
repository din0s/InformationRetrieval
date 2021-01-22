from bs4 import BeautifulSoup
from threading import Thread
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords

import nltk
import re
import requests
import sys

INVALID_HREF_PATTERN = re.compile(r"(?:(?:mailto|tel):.*)|(?:{{.*}})")
URL_PATTERN = re.compile(r"(https?:\/\/([^\?#]*)).*")

nltk.download('stopwords', quiet=True)
STOPWORDS = set(stopwords.words('english'))
STEMMER = PorterStemmer()

class CrawlerWorker(Thread):
    def __init__(self, db, pages_left, sites, visited):
        Thread.__init__(self)
        self.db = db
        self.pages_left = pages_left
        self.sites = sites
        self.visited = visited

    def run(self):
        while self.pages_left.get() > 0:
            website = self.sites.get()
            try:
                self.__crawl_site(website)
            except:
                self.pages_left.increment()
            self.sites.task_done()

    def __crawl_site(self, website):
        website = self.__fix_url(website)
        if self.visited.has(website):
            # already visited
            return

        if self.pages_left.get() == 0:
            # no pages left
            return

        self.pages_left.decrement()
        self.visited.add(website)

        print("crawling %s (%d remaining)" % (website, self.pages_left.get()))
        sys.stdout.flush()

        try:
            soup, html = self.__fetch_page(website)
        except:
            print("Something went wrong when fetching", website)
            self.pages_left.increment()
            return

        info = self.__extract_info(html, website)
        if info is None:
            print("Found empty page")
            self.pages_left.increment()
        else:
            self.db.insert(info)
            self.__find_next(website, soup)

    def __fix_url(self, url):
        if not URL_PATTERN.match(url):
            url = "http://" + url
        if not url.endswith("/"):
            url += "/"
        return url

    def __fetch_page(self, url):
        req = requests.get(url)
        soup = BeautifulSoup(req.content, 'html.parser')
        return soup, soup.prettify()

    def __preprocess(self, text):
        # https://towardsdatascience.com/all-you-need-to-know-about-text-preprocessing-for-nlp-and-machine-learning-bc1c5765ff67
        result = []
        for word in text.split():
            # Lowercasing
            word = word.lower()

            # Punctuation Removal
            word = re.sub(r'[^\w\s]', '', word)

            # Stopword Removal
            if not word or word in STOPWORDS:
                continue

            # Stemming
            word = STEMMER.stem(word)

            result.append(word)
        return result

    def __extract_info(self, html, url):
        soup = BeautifulSoup(html, 'html.parser')
        if soup.find("title"):
            title = soup.find("title").string.strip()
        else:
            title = url
        base = soup.body.main or soup.body

        content = self.__preprocess(base.get_text("\n", strip=True))
        if not content:
            return None

        url = url.strip("#")
        info = {
            "url": url,
            "title": title,
            "content": content
        }

        desc = soup.find("meta", attrs={"name": "description"})
        if desc:
            info['summary'] = desc['content'].strip()
            return info

        for t in base.find_all("div"):
            txt = t.get_text(strip=True)
            if len(txt) > 250:
                info['summary'] = txt
                return info

        info['summary'] = "No summary available"
        return info

    def __find_next(self, base, soup):
        match = URL_PATTERN.search(base)
        domain = "http://" + match.group(2).split("/")[0]

        for a in soup.find_all("a"):
            href = a.get("href")

            if href is None or INVALID_HREF_PATTERN.match(href):
                continue
            elif href.startswith("/"):
                href = domain + href
            elif not URL_PATTERN.match(href):
                href = domain + "/" + href

            if not URL_PATTERN.match(href):
                print("Unexpected URL:", href)
            else:
                match = URL_PATTERN.search(href)
                site = match.group(1).strip("#")
                self.sites.put(site)
