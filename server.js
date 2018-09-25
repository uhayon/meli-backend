const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const API_PREFFIX = '/api/items';

app.use(bodyParser.json());
app.use(cors());

/******** GENERAL METHODS ********/
const parseAuthor = () => {
  return {
    name: 'Uriel',
    lastName: 'Hayon'
  };
}

const parseItem = (item) => {
  const { id, title, price, currency_id, thumbnail: picture, condition, shipping: { free_shipping } } = item;
  const decimals = price.toString().split('.')[1];
  return {
    id,
    title,
    price: {
      currency: currency_id,
      amount: price,
      decimals: decimals ? decimals.length : 0
    },
    picture,
    condition,
    free_shipping
  }
}

/********************************/

const parseSearchCategories = (filters) => {
  const category = filters.find(filter => {
    return filter.id === 'category';
  });

  let categories = [];
  if (category) {
    const categoryValues = category.values.pop();
    const categoriesArray = categoryValues.path_from_root;
    for (let i = 0; i < categoriesArray.length; i++) {
      categories = [...categories, categoriesArray[i].name];
    }
  }

  return categories;
}

const parseSearchItems = (items) => {
  return items.map(item => parseItem(item));
}

const parseSearchData = (data) => {
  const { results, filters } = data;


  return {
    author: parseAuthor(),
    categories: parseSearchCategories(filters),
    items: parseSearchItems(results)
  };
}

const searchData = async (query) => {
  const response = await axios.get(`https://api.mercadolibre.com/sites/MLA/search?q=${query}&limit=4`);
  const { data } = response;

  return parseSearchData(data);
}

app.get(`${API_PREFFIX}`, async (req, res) => {
  const { q } = req.query;
  const validQuery = q && q.trim().length > 0;

  if (validQuery) {
    try {
      const data = await searchData(q);
      res.json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json('Ingresá un criterio de búsqueda');
  }
});

app.listen(3000, () => {
  console.log('App is running on port 3000');
});
