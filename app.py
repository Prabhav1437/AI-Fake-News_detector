import requests
import csv

API_KEY = "88d2669ec2114edfb54d08d563480d88"

url = "https://newsapi.org/v2/everything"

params = {
    "q": "Iran",
    "language": "en",
    "sortBy": "publishedAt",
    "pageSize": 100,
    "apiKey": API_KEY
}

response = requests.get(url, params=params)

print("Status code:", response.status_code)

data = response.json()

if data.get("status") != "ok":
    print("Error:", data)
else:
    articles = data.get("articles", [])

    with open("news_dataset4.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow(["title", "content", "source", "url", "label"])

        for article in articles:
            title = article.get("title", "")
            content = article.get("content") or article.get("description", "")
            source = article.get("source", {}).get("name", "")
            article_url = article.get("url", "")

            if not title or not content:
                continue

            label = "REAL"

            writer.writerow([title, content, source, article_url, label])

    print("Dataset saved as news_dataset.csv")