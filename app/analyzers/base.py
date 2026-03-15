from abc import ABC, abstractmethod

from bs4 import BeautifulSoup

from app.models.response import ModuleResult


class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, soup: BeautifulSoup, text: str, html: str) -> ModuleResult:
        pass
