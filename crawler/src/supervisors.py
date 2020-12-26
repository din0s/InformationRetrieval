from atomic import AtomicInteger, AtomicSet
from queue import Queue
from workers import CrawlerWorker


class CrawlerSupervisor:
    def __init__(self, pages_num, threads_num):
        self.pages_left = AtomicInteger(pages_num)
        self.sites = Queue()

        visited = AtomicSet()
        for _ in range(min(pages_num - 1, threads_num)):
            worker = CrawlerWorker(self.pages_left, self.sites, visited)
            worker.start()

    def start(self, url):
        self.sites.put(url)
