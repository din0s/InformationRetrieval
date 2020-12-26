from bs4 import BeautifulSoup
from threading import Thread

import os
# import random
import re  # regex
import requests
import time
import trafilatura

INVALID_HREF_PATTERN = re.compile(r"(?:(?:mailto|tel):.*)|(?:{{.*}})")
URL_PATTERN = re.compile(r"(https?:\/\/([^\?#]*)).*")


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
            self._crawl_site(website)
            self.sites.task_done()

    def _crawl_site(self, website):
        website = self._fix_url(website)
        if (self.visited.has(website)):
            # already visited
            return

        if self.pages_left.get() == 0:
            # no pages left
            return

        self.pages_left.decrement()
        self.visited.add(website)

        # time.sleep(random.random() * 3)
        print("crawling %s (%d remaining)" % (website, self.pages_left.get()))

        try:
            soup, html = self._fetch_page(website)
        except:
            print("Something went wrong when fetching", website)
            self.pages_left.increment()
            return

        text = self._extract_text(html)
        if text is None:
            print("Found empty page")
            self.pages_left.increment()
        else:
            self._write_to_file(website, text)
            self._find_next(website, soup)

    def _fix_url(self, url):
        if not URL_PATTERN.match(url):
            url = "http://" + url
        if not url.endswith("/"):
            url += "/"
        return url

    def _fetch_page(self, url):
        req = requests.get(url)
        soup = BeautifulSoup(req.content, 'html.parser')
        return soup, soup.prettify()

    def _extract_text(self, html):
        return trafilatura.extract(html)

    def _write_to_file(self, url, text):
        match = URL_PATTERN.search(url)
        page = match.group(2).strip("/").split("/")

        if len(page) == 1:
            page.append("index.html")

        if "." not in page[-1]:
            page[-1] += ".html"

        os.makedirs("results/" + "/".join(page[:-1]), exist_ok=True)
        with open("results/" + "/".join(page), "w", encoding="utf8") as f:
            f.write(text)

    def _find_next(self, base, soup):
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