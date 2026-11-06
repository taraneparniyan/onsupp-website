require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const jsonPath = path.join(__dirname, '../../../../scratch/articles_data.json');
  const articles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('Loaded articles from JSON:', articles.length);

  const officialSlugs = articles.map(a => a.slug);

  for (const a of articles) {
    const existing = await prisma.article.findUnique({ where: { slug: a.slug } });
    const data = {
      titleFa: a.titleFa,
      titleEn: a.titleEn,
      language: a.language || 'fa',
      categoryFa: a.categoryFa,
      categoryEn: a.categoryEn,
      excerptFa: a.excerptFa,
      excerptEn: a.excerptEn,
      contentFa: a.contentFa,
      contentEn: a.contentEn,
      readTimeFa: a.readTimeFa,
      readTimeEn: a.readTimeEn,
      imageUrl: a.imageUrl,
      author: a.author,
      published: true,
      metaTitleFa: a.metaTitleFa,
      metaTitleEn: a.metaTitleEn,
      metaDescFa: a.metaDescFa,
      metaDescEn: a.metaDescEn,
      keywordsFa: a.keywordsFa,
      keywordsEn: a.keywordsEn,
      canonicalUrl: a.canonicalUrl,
      ogImage: a.ogImage || a.imageUrl,
      createdAt: new Date(a.createdAt)
    };

    let saved;
    if (existing) {
      saved = await prisma.article.update({ where: { id: existing.id }, data });
      await prisma.articleFaq.deleteMany({ where: { articleId: existing.id } });
      console.log('Updated existing article:', a.slug, 'id=' + saved.id);
    } else {
      saved = await prisma.article.create({ data: { slug: a.slug, ...data } });
      console.log('Created new article:', a.slug, 'id=' + saved.id);
    }

    if (a.faqs && a.faqs.length) {
      await prisma.articleFaq.createMany({
        data: a.faqs.map((f, i) => ({
          articleId: saved.id,
          question: f.question,
          answer: f.answer,
          order: f.order || i + 1
        }))
      });
      console.log('  Added FAQs for', a.slug, 'count:', a.faqs.length);
    }
  }

  // Remove any remaining old or test articles
  const obsolete = await prisma.article.findMany({
    where: { slug: { notIn: officialSlugs } }
  });

  if (obsolete.length > 0) {
    console.log('Found obsolete articles to remove:', obsolete.map(o => o.slug));
    for (const o of obsolete) {
      await prisma.comment.deleteMany({ where: { articleId: o.id } });
      await prisma.articleFaq.deleteMany({ where: { articleId: o.id } });
      await prisma.article.delete({ where: { id: o.id } });
      console.log('Deleted obsolete article:', o.slug);
    }
  }

  const final = await prisma.article.findMany({
    include: { faqs: true },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n================ DB SYNC COMPLETED ================');
  console.log('Total articles in DB:', final.length);
  final.forEach(f => {
    console.log(`- [${f.slug}] ID: ${f.id} | Title: ${f.titleFa} | FAQs: ${f.faqs.length} | Published: ${f.published}`);
  });
}

run()
  .catch(e => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
