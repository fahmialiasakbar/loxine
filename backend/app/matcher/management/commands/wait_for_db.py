import time

from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Wait until database is available"

    def handle(self, *args, **options):
        self.stdout.write("Menunggu database siap...")

        while True:
            try:
                connection = connections["default"]
                connection.cursor()
                break
            except OperationalError:
                self.stdout.write("Database belum siap, coba lagi 1 detik...")
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS("Database siap"))
