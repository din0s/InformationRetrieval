from supervisors import CrawlerSupervisor

import sys

def get_args():
    if len(sys.argv) != 5:
        raise Exception(f"Invalid Usage:\nReceived: {' '.join(sys.argv)}\nExpected: {sys.argv[0]} <website> <pages> <append> <threads>")

    website = sys.argv[1]
    pages_num = int(sys.argv[2])
    append = int(sys.argv[3]) != 0
    threads_num = int(sys.argv[4])
    return website, pages_num, append, threads_num

if __name__ == "__main__":
    website, pages_num, append, threads_num = get_args()
    visor = CrawlerSupervisor(pages_num, threads_num, append)
    visor.start(website)
