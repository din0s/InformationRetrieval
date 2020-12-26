from threading import Lock

# https://julien.danjou.info/atomic-lock-free-counters-in-python/


class AtomicInteger():
    def __init__(self, value=0):
        self._value = value
        self._lock = Lock()

    def get(self):
        return self._value

    def increment(self):
        with self._lock:
            self._value += 1

    def decrement(self):
        with self._lock:
            self._value -= 1


class AtomicSet():
    def __init__(self):
        self._set = set()
        self._lock = Lock()

    def has(self, item):
        return item in self._set

    def add(self, item):
        with self._lock:
            self._set.add(item)

    def pop(self):
        item = None
        with self._lock:
            item = self.pop()
        return item
