# Sneakers House

Sneakers House is an online shoe shopping website made for customers in Bangladesh. Customers can browse sneakers, check prices in Bangladeshi Taka (৳), create an account, add products to their cart, and place orders.

The website is built using HTML, CSS, JavaScript, Node.js, and Express, with a simple JSON file database (`database/db.json`).

## Project Structure

```text
project/
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── login.html
│   ├── register.html
│   ├── products.html
│   ├── product_detail.html
│   ├── cart.html
│   ├── checkout.html
│   ├── profile.html
│   ├── order_detail.html
│   ├── order_success.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
├── backend/
│   ├── server.js
│   ├── config/
│   ├── routes/
│   └── controllers/
├── database/
│   ├── database.sql
│   └── db.json
├── package.json
└── README.md
```

## How to Run the Project

Follow these steps to run the website on your computer.

1. Install Node.js if you haven't installed it yet.
2. Open the project folder in VS Code.
3. Open the terminal in VS Code.
4. Run the following commands one by one:

```bash
npm install
npm run init-db
npm start
```

After the server starts, open this link in your browser:

http://localhost:3000/

## Deploying Online (Render / Vercel / Netlify)

The project now includes the config files each host needs: `render.yaml`, `vercel.json`, `netlify.toml`, and `netlify/functions/api.js`.

**Render (recommended)**
1. Push the project to GitHub.
2. Render → New → Web Service → pick the repo.
3. Build Command: `npm install`  |  Start Command: `npm start`
4. Add the environment variable `SESSION_SECRET` (any long random text).

**Vercel**: Import the GitHub repo. No settings needed — `vercel.json` does the rest.

**Netlify**: Import the GitHub repo. No settings needed — `netlify.toml` does the rest.

> Important: Vercel and Netlify have no permanent disk, and Render's free plan resets its disk on every redeploy. New accounts and orders saved in `database/db.json` can be lost. To keep data permanently, attach a Render Disk and set `DATA_DIR` to its mount path (for example `/var/data`), or move to a hosted database. Every order is also sent to the shop owner's WhatsApp from the order success page, so no order is lost.

## Payment (bKash) and Contact

* Customers choose **bKash** or **Cash on Delivery** at checkout.
* For bKash, they send the total to **01611755093** (Send Money), then enter their bKash number and the Transaction ID (TrxID). The order is saved as "Awaiting payment verification".
* The admin checks the payment in the bKash app and marks the order paid (`PUT /api/orders/:id/status`, admin login required). Customers see the live status on their order page (refreshes every 10 seconds).
* The **Buy Now** button on a product page goes straight to checkout.
* **WhatsApp** and **Gmail** buttons (floating on every page, plus the contact page and footer) open WhatsApp / Gmail directly. Contact details are kept in one place: the `SITE` object at the top of `frontend/js/script.js`.

## Login with Google (one-time setup)

1. Go to https://console.cloud.google.com → APIs & Services → Credentials → Create Credentials → **OAuth client ID** → type **Web application**.
2. Under **Authorized JavaScript origins** add your site links (for example `http://localhost:3000` and your Render/Vercel/Netlify link).
3. Copy the Client ID and set it as the environment variable `GOOGLE_CLIENT_ID`
   (locally in PowerShell: `$env:GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"; npm start`).

Until this is set, the Google button stays hidden.

## Demo Accounts

You can use these accounts to test the website.

| Role     | Username | Password  |
| -------- | -------- | --------- |
| Admin    | admin    | admin1234 |
| Customer | demo     | demo1234  |

## Website Features

* Home page with featured sneakers
* About and Contact pages
* Product list and product details
* User registration and login
* Shopping cart and checkout
* Customer profile and order history
* Product management for the admin
* Contact form to receive customer messages
* Prices displayed in Bangladeshi Taka (৳)
* Responsive design for mobile phones and computers
* Form validation to check user input

## Technologies Used

| Technology      | Purpose                      |
| --------------- | ---------------------------- |
| HTML            | Creates the website pages    |
| CSS             | Styles the website           |
| JavaScript      | Adds interactive features    |
| Node.js         | Runs the backend             |
| Express.js      | Handles server requests      |
| JSON file DB    | Stores website data          |
| bcryptjs        | Helps protect user passwords |
| cookie-session  | Keeps users logged in (works on serverless hosts) |
| serverless-http | Runs Express on Netlify Functions |

## API Endpoints

These API endpoints allow the frontend to communicate with the backend.

| Method | Endpoint                   | Purpose                        |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/api/auth/register`       | Create a new account           |
| POST   | `/api/auth/login`          | Log in                         |
| POST   | `/api/auth/logout`         | Log out                        |
| GET    | `/api/auth/me`             | Check the current user         |
| GET    | `/api/products`            | View all products              |
| GET    | `/api/products/:slug`      | View product details           |
| GET    | `/api/products/categories` | View product categories        |
| GET    | `/api/cart`                | View the shopping cart         |
| POST   | `/api/cart/add`            | Add a product to the cart      |
| PUT    | `/api/cart/update`         | Update product quantity        |
| DELETE | `/api/cart/:productId`     | Remove a product from the cart |
| POST   | `/api/orders/checkout`     | Place an order (bKash or COD)  |
| GET    | `/api/orders/payment-info` | bKash number for checkout      |
| GET    | `/api/orders/admin/all`    | All orders (admin)             |
| PUT    | `/api/orders/:id/status`   | Update order/payment status (admin) |
| GET    | `/api/orders/my`           | View personal orders           |
| GET    | `/api/orders/:id`          | View order details             |
| POST   | `/api/contact`             | Send a contact message         |
| GET    | `/api/profile`             | View the customer profile      |
| PUT    | `/api/profile`             | Update the customer profile    |

## Database

The website stores its data in `database/db.json` (same tables as `database/database.sql`). The main database tables are:

* **users:** Stores customer account information.
* **profiles:** Stores customer contact and address details.
* **categories:** Stores product categories.
* **products:** Stores sneaker names, prices, sizes, stock, and other details.
* **contact_messages:** Stores messages sent through the contact form.
* **orders:** Stores customer orders and shipping information.
* **order_items:** Stores the products included in each order.

The database structure can be found in `database/database.sql`.

## Project Goal

The goal of this project is to build a working online sneaker store where customers can browse products, manage their accounts, and place orders. It also provides an admin section for managing products and demonstrates how frontend, backend, and database technologies work together.
