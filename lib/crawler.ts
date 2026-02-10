import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawlerStoryInfo {
    name: string;
    author: string;
    description: string;
    image: string;
    categories: string[];
    status: string;
}

export interface CrawlerChapter {
    title: string;
    url: string;
    number?: number;
}

export interface CrawlerChapterContent {
    title: string;
    content: string;
}

export class TruyenFullCrawler {
    private baseUrl = 'https://truyenfull.vision';

    async getStoryInfo(url: string): Promise<CrawlerStoryInfo> {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            const name = $('.title').first().text().trim();
            const author = $('.info a[itemprop="author"]').text().trim();
            const description = $('.desc-text').html() || '';
            const image = $('.book img').attr('src') || '';
            const status = $('.info .text-success').text().trim() || $('.info .text-primary').text().trim();

            const categories: string[] = [];
            $('.info a[itemprop="genre"]').each((_, el) => {
                categories.push($(el).text().trim());
            });

            return {
                name,
                author,
                description,
                image: image.startsWith('http') ? image : `${this.baseUrl}${image}`,
                categories,
                status
            };
        } catch (error) {
            console.error('Error fetching story info:', error);
            throw new Error('Failed to fetch story information');
        }
    }

    async getChapterList(url: string): Promise<CrawlerChapter[]> {
        try {
            let allChapters: CrawlerChapter[] = [];
            let currentPage = 1;
            let hasNextPage = true;

            // Ensure url ends with /
            const baseStoryUrl = url.endsWith('/') ? url : `${url}/`;

            while (hasNextPage) {
                const pageUrl = currentPage === 1 ? baseStoryUrl : `${baseStoryUrl}trang-${currentPage}/#list-chapter`;

                const { data } = await axios.get(pageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                const $ = cheerio.load(data);

                const pageChapters: CrawlerChapter[] = [];
                $('.list-chapter li a').each((_, el) => {
                    const title = $(el).text().trim();
                    const path = $(el).attr('href') || '';

                    // Extract chapter number from title (e.g., "Chương 123: ..." -> 123)
                    const numMatch = title.match(/chương\s+(\d+)/i);
                    const chapterNumber = numMatch ? parseInt(numMatch[1]) : undefined;

                    pageChapters.push({
                        title,
                        url: path.startsWith('http') ? path : `${this.baseUrl}${path}`,
                        number: chapterNumber
                    });
                });

                if (pageChapters.length === 0) {
                    hasNextPage = false;
                } else {
                    allChapters = [...allChapters, ...pageChapters];

                    // Check if there's a "next" page link or if we've reached the last page
                    // TruyenFull pagination usually has a .pagination class
                    const nextLink = $('ul.pagination li a:contains("Trang tiếp")').length > 0 ||
                        $('ul.pagination li.active + li a').length > 0;

                    if (!nextLink || currentPage > 100) { // Safety limit of 100 pages for now
                        hasNextPage = false;
                    } else {
                        currentPage++;
                    }
                }

                // Be polite if fetching many pages
                if (hasNextPage) await new Promise(resolve => setTimeout(resolve, 300));
            }

            return allChapters;
        } catch (error) {
            console.error('Error fetching chapter list:', error);
            throw new Error('Failed to fetch chapter list');
        }
    }

    async getChapterContent(url: string): Promise<CrawlerChapterContent> {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            const title = $('.chapter-title').text().trim();
            // Remove ad elements if they exist
            $('.ads-holder, .ads-chapter').remove();
            const content = $('.chapter-c').html() || '';

            return {
                title,
                content
            };
        } catch (error) {
            console.error('Error fetching chapter content:', error);
            throw new Error('Failed to fetch chapter content');
        }
    }
}
