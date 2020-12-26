from supervisors import CrawlerSupervisor

import os
import shutil
import sys

def get_args():
    if len(sys.argv) != 5:
        raise Exception("Invalid Usage: %s <website> <pages> <append> <threads>" % sys.argv[0])

    website = sys.argv[1]
    pages_num = int(sys.argv[2])
    append = int(sys.argv[3]) != 0
    threads_num = int(sys.argv[4])
    return website, pages_num, append, threads_num

if __name__ == "__main__":
    website, pages_num, append, threads_num = get_args()
    
    if not append and os.path.exists("results"):
        shutil.rmtree("results")

    visor = CrawlerSupervisor(pages_num, threads_num)
    visor.start(website)
