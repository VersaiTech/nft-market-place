const express = require('express');
const app = express();
// This is your test secret API key.
const stripe = require('stripe')(
  'sk_test_51N0MBxSFOgmzSXInjr2O1QUhLQDvYXPG5SoaOnqxxG5vvEmpIF7L4CYcuguiASjAhpYl2yxmStKlQKTDC6wRp7f700AfHTrcVJ',
);
const cors = require('cors');
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
const coingeckoApiPro = require('coingecko-api-pro');

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount

  return 1400;
};

app.post('/create-payment-intent', async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: 'inr',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post('/create-customer', async (req, res) => {
  const { username, email } = req.body;
  try {
    // const foundUser = await User.findOne({username: username});
    // if (! foundUser) {
    //     return res.status(404).json({error: "User with Username" + username + "is not found in database"});
    // }
    const foundUser = {
      email: email,
    };
    const customer = await stripe.customers.create({
      name: username,
      email: foundUser.email,
    });

    // const newTx = await Tx({tx_id:{customerid:customer.id,productid:null},username:foundUser.username,email:foundUser.email,tx_type:"card",product:{},price:null,quantity:null,cutomername:null,billingdetails:null,state:"Started",tx_status:"Intiated"})
    // await newTx.save();

    return res
      .status(200)
      .json({ customer_id: customer.id, customer_email: customer.email });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
});

app.post('/checkout', async function (req, res) {
  const {
    customer_id,
    itemid,
    chainId,
    price,
    quantity,
    success_URL,
    cancel_URL,
  } = req.body;
  //console.log(req.body);
  try {
    // const foundCustomer = await Tx.findOne({"tx_id.customerid": customer_id});
    // console.log(foundCustomer);
    //   if (!foundCustomer) {

    //  return res.status(404).json({error: "Transaction not found"});

    // }

    // const founditem = await Info.findOne({itemid:itemid,networkId:chainId});
    // console.log(founditem);
    // if (!founditem) {

    //   return res.status(404).json({error: "Product not found"});

    // }

    // const foundnft =  await NFT.findOne({nftid:founditem.tokenid, address:founditem.nftaddress, networkId: chainId});

    // if(!foundnft.available){

    //   return res.status(404).json({error: "NFT is not avilable"});

    // }

    const foundnft = {
      itemid: 2,
      name: 'NFT2',
      nftid: '1234562',
      address: '0x1234562',
    };

    const productdesc = {
      itemid: foundnft.itemid,
      name: foundnft.name,
      tokenid: foundnft.nftid,
      address: foundnft.address,
    };

    const _product = await stripe.products.create({
      name: foundnft.name,
      active: true,
      metadata: productdesc,
    });

    const _price = await stripe.prices.create({
      unit_amount: price * 100,
      currency: 'usd',
      product: _product.id,
    });

    const session = await stripe.checkout.sessions.create({
      customer: 'cus_NnnnHjxIgUyPBO',
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: _price.id,
          quantity: quantity,
        },
      ],
      success_url: success_URL,
      cancel_url: cancel_URL,
    });

    // await Tx.updateOne({"tx_id.customerid": customer_id,username:foundCustomer.username},{$set: {price:price*100,quantity:quantity,product: productdesc,state:"Pending", tx_id:{customerid:customer_id,productid:_product.id}}},{new:true});

    return res.status(200).json({ sessionid: session.id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/create-payment', async (req, res) => {
  const {
    customer_id,
    card_ExpYear,
    card_ExpMonth,
    card_Number,
    card_CVC,
    billing_details,
  } = req.body;
  try {
    // const foundCustomer = await Tx.findOne({ "tx_id.customerid": customer_id });

    // if (!foundCustomer) {
    //   return res.status(403).json({ error: "Transaction not Started" });
    // }

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
      billing_details: billing_details,
    });

    // const attachpaymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, { customer: foundCustomer.tx_id.customerid });

    // Convert MATIC to usd

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 900,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      customer: customer_id,
      payment_method: paymentMethod.id,
      setup_future_usage: 'off_session',
    });

    // await Tx.updateOne({ "tx_id.customerid": foundCustomer.tx_id.customerid, username: foundCustomer.username }, { $set: { customername: card_Name, billingdetails: billing_details, state: "Pending", tx_staus: "Processing" } }, { new: true });

    return res.status(200).json({
      paymentintent_id: paymentIntent,
      attachpaymentmethod: paymentMethod.id,
      message: 'Payment Intaited',
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// app.post for converting matic to usd

app.post('/convert-matic', async (req, res) => {
  try {
    const CoinGeckoClient = new coingeckoApiPro();
    let data = await CoinGeckoClient.simple.price({
      ids: ['matic-network', 'ethereum', 'binancecoin', 'tether', 'usd-coin'],
      vs_currencies: ['usd'],
      include_last_updated_at: 'true',
      precision: '4',
    });
    return res
      .status(200)
      .json({ maticprice: data.data['matic-network']['usd'] });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

app.post('/confirm-payment', async (req, res) => {
  const { paymentintent_id, attachpaymentmethod, return_URL } = req.body;
  /*
  using axios confirmPaymentIntent will be called in handle payment function in client side and after with the response of this 
  payment intent if we get client secret key at the client side then we have to you handle card action/ handle a next action of stripe then after
  we'll check the response of success(redirect to success_URL) or fail(redirect to return_URL)
      */
  try {
    // const foundCustomer = await Tx.findOne({customerid: customer_id});
    // if (!foundCustomer) {
    //  return res.status(403).json({error: "Transaction not Started"});
    // }

    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentintent_id,
      { payment_method: attachpaymentmethod, return_url: return_URL },
    );

    if (paymentIntent.status === 'succeeded') {
      // await Tx.updateOne({"tx_id.customerid": foundCustomer.customerid,username:foundCustomer.username},{$set: {state:"Completed",tx_staus:"Success"}},{new:true});

      return res.status(200).json({ message: 'Payment succeeded' });
    } else if (paymentIntent.status === 'requires_action') {
      // await Tx.updateOne({"tx_id.customerid": foundCustomer.customerid,username:foundCustomer.username},{$set: {state:"Pending",tx_staus:"Processing"}},{new:true});

      return res.status(200).json({
        requiresAction: true,
        paymentKey: paymentIntent.client_secret,
      });
    } else {
      // await Tx.updateOne({"tx_id.customerid": foundCustomer.customerid,username:foundCustomer.username},{$set: {state:"Completed",tx_staus:"Failed"}},{new:true});

      return res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
});

app.listen(4242, () => console.log('Node server listening on port 4242!'));
