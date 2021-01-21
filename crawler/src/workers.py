from bs4 import BeautifulSoup
from threading import Thread
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords

import nltk
import os
import re
import requests
import sys

INVALID_HREF_PATTERN = re.compile(r"(?:(?:mailto|tel):.*)|(?:{{.*}})")
URL_PATTERN = re.compile(r"(https?:\/\/([^\?#]*)).*")

nltk.download('stopwords', quiet=True)
STOPWORDS = set(stopwords.words('english'))
STEMMER = PorterStemmer()

class CrawlerWorker(Thread):
    def __init__(self, pages_left, sites, visited):
        Thread.__init__(self)
        # self.daemon = True
        self.pages_left = pages_left
        self.sites = sites
        self.visited = visited

    def run(self):
        while self.pages_left.get() > 0:
            website = self.sites.get()
            self.__crawl_site(website)
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

        # time.sleep(random.random() * 3)
        print("crawling %s (%d remaining)" % (website, self.pages_left.get()))
        sys.stdout.flush()

        try:
            soup, html = self.__fetch_page(website)
        except:
            print("Something went wrong when fetching", website)
            self.pages_left.increment()
            return

        text = self.__extract_text(html, website)
        if text is None:
            print("Found empty page")
            self.pages_left.increment()
        else:
            self.__write_to_file(website, text)
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
        return " ".join(result)

    def __extract_text(self, html, url):
        soup = BeautifulSoup(html, 'html.parser')
        if soup.find("title"):
            title = soup.find("title").string.strip()
        else:
            title = url
        base = soup.body.main or soup.body

        content = self.__preprocess(base.get_text("\n", strip=True))
        if not content.strip():
            return None

        desc = soup.find("meta", attrs={"name": "description"})
        if desc:
            return f"{title}\n{desc['content'].strip()}\n{content}"

        for t in base.find_all("div"):
            txt = t.get_text(strip=True)
            if len(txt) > 250:
                return f"{title}\n{txt}\n{content}"
        return f"{title}\nNo summary available.\n{content}"

    def __write_to_file(self, url, text):
        match = URL_PATTERN.search(url)
        page = match.group(2).strip("/").split("/")

        if len(page) == 1:
            page.append("#")

        if "." not in page[-1] and not page[-1].endswith("#"):
            page[-1] += "#"

        os.makedirs("results/" + "/".join(page[:-1]), exist_ok=True)
        with open("results/" + "/".join(page), "w", encoding="utf8") as f:
            f.write(text)

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
