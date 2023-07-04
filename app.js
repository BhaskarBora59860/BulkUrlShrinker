const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/schema');
const app = express();
const axios=require('axios');

const methodOverride = require('method-override');

mongoose.connect('mongodb://127.0.0.1:27017/bulkUrl')
  .then(() => console.log('Connected!'));

app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));


app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls }); // Pass the shortUrls variable to the template
  } catch (error) {
    console.error('Error retrieving short URLs:', error);
    res.render('index', { shortUrls: [], alertMessage: 'Failed to retrieve short URLs.' });
  }
});

app.post('/shortUrls/:id/share/facebook', async (req, res) => {
  const id = req.params.id;
  const shortUrl = await ShortUrl.findById(id);

  if (shortUrl) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl.full)}`;
    
    try {
      // Make a POST request to the Facebook API to share the URL
      const response = await axios.post(`https://graph.facebook.com/v13.0/me/feed`, {
        link: shortUrl.full,
        access_token: 'EAABiGGP0Mo4BABVprNY0k1J2rEDp2mffjvZCxOucqAcEn4ogVYgcLi58TKGZAydfzidVMyWg69GKW9PmZAyZCZBZBtFHStwT62TdTLP10lF1M5ebVBYFEDHnJ8aUH8NTcV1SI2gFrINiauqXx6lPJd4uonbr0OJ313LGW712rH94pdcqp31TZBObLuima84BoZAZBVLnrU7YjvdzwS4C710DuYND3r0ipA5zZBg1zv7sBXuFE49CLyiC7ZA',
      });

      // Handle the API response
      console.log('Shared on Facebook:', response.data);
      res.sendStatus(200);
    } catch (error) {
      console.error('Error sharing on Facebook:', error.response.data);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});
app.get('/shortUrls/:id/share/facebook', async (req, res) => {
  const id = req.params.id;
  const shortUrl = await ShortUrl.findById(id);

  if (shortUrl) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl.full)}`;
    res.redirect(shareUrl);
  } else {
    res.sendStatus(404);
  }
});

app.post('/shortUrls/:id/share/facebook', async (req, res) => {
  const id = req.params.id;
  const shortUrl = await ShortUrl.findById(id);

  if (shortUrl) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl.full)}`;
    res.redirect(shareUrl);
  } else {
    res.sendStatus(404);
  }
});


app.get('/bulkUrls', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('bulkUrls', { alertMessage: undefined, shortUrls: shortUrls });
  } catch (error) {
    console.error('Error retrieving short URLs:', error);
    res.render('bulkUrls', { alertMessage: 'Failed to retrieve short URLs.', shortUrls: [] });
  }
});

// Handle the POST request for bulk URLs
app.post('/shortUrls', async (req, res) => {
  const fullUrl = req.body.fullUrl;
  const customUrl = req.body.customUrl;
  const expirationDate = req.body.expirationDate; 
  try {
    const newShortUrl = new ShortUrl({
      full: fullUrl,
      short: customUrl,
     expirationDate: expirationDate,
      clicks: 0,
    });
    await newShortUrl.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.render('index', { alertMessage: 'Failed to create short URL.' });
  }
});
app.post('/bulkUrls', async (req, res) => {
  const urls = req.body.urls.trim().split('\n');
  const expirationDate = req.body.expirationDate;

  try {
    const shortUrls = await Promise.all(urls.map(async (url) => {
      // const previewData = await linkPreview.getPreview(url);

      const newShortUrl = new ShortUrl({
        full: url,
        short: generateShortUrl(),
        // preview: {
        //   title: previewData.title || '',
        //   description: previewData.description || '',
        //   image: previewData.images[0] || '',
        // },
        clicks: 0,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      });

      await newShortUrl.save();
      return newShortUrl;
    }));

    res.render('bulkUrls', { shortUrls });
  } catch (error) {
    console.error('Error shortening bulk URLs:', error);
    res.render('bulkUrl', { shortUrls: [], alertMessage: 'Failed to shorten bulk URLs.' });
  }
});




app.delete('/shortUrls/:id', async (req, res) => {
  const id = req.params.id;
  await ShortUrl.findByIdAndRemove(id);
  res.redirect('/');
});

app.post('/shortUrls/deleteAll', async (req, res) => {
  await ShortUrl.deleteMany();
  res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) {
    return res.sendStatus(404);
  }

  if (shortUrl.expirationDate && new Date() > shortUrl.expirationDate) {
    // Link has expired
    return res.render('expired', { fullUrl: shortUrl.full });
  }

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});
function generateShortUrl() {
  const length = 6; // Adjust the desired length of the short URL here
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});