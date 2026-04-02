import kagglehub
import csv
import os

path = kagglehub.dataset_download("csmalarkodi/isot-fake-news-dataset")

fake_file = os.path.join(path, "Fake.csv")

output_file = "fake_news_dataset.csv"

with open(fake_file, "r", encoding="utf-8") as f, \
     open(output_file, "w", newline="", encoding="utf-8") as out:

    reader = csv.DictReader(f)
    writer = csv.writer(out)

    writer.writerow(["title", "content", "label"])

    for row in reader:
        title = row.get("title", "")
        content = row.get("text", "")

        if not title or not content:
            continue

        writer.writerow([title, content, "FAKE"])

print("Fake dataset saved as fake_news_dataset.csv")