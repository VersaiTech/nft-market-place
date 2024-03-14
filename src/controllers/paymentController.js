const User = require("../models/UserModel");
const Tx = require("../models/TransactionModel");
const NFT = require("../models/NFTModel");
const Info = require("../models/InfoModel");
const Stripe = require("stripe");
const Orders = require("../models/OrderModel");
const coingeckoApiPro = require('coingecko-api-pro');
const uuid = require("uuid-random");
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);

const getPriceOfMaticUSD = async (req, res) => {
    try {
        const CoinGeckoClient = new coingeckoApiPro();
        let data = await CoinGeckoClient.simple.price({
            ids: [
                'matic-network',
                'ethereum',
                'binancecoin',
                'tether',
                'usd-coin'
            ],
            vs_currencies: ['usd'],
            include_last_updated_at: 'true',
            precision: '4'
        });
        return res.status(200).json({maticprice: data.data['matic-network']['usd']
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({message: err.message});
    }
}


const createCustomer = async (req, res) => {
    const username = req.body.username;
    try {
        const foundUser = await User.findOne({username: username});
        if (! foundUser) {
            return res.status(404).json({
                error: "User with Username" + username + "is not found in database"
            });
        }

        const customer = await stripe.customers.create({name: req.body.username, email: foundUser.email});

        return res.status(200).json({customer_id: customer.id, customer_email: customer.email});

    } catch (err) {
        console.log(err)
        return res.status(400).json({message: err.message});
    }
}

const checkOut = async function (req, res) {
    console.log("checkout route reached")

    const {
        customer_id,
        itemid,
        chainId,
        price,
        quantity,
        success_URL,
        cancel_URL
    } = req.body
    console.log(req.body);
    try {

        const founditem = await Info.findOne({itemid: itemid, networkId: chainId});
        console.log(founditem);
        if (! founditem) {

            return res.status(404).json({error: "Product not found"});

        }

        const foundnft = await NFT.findOne({nftid: founditem.tokenid, address: founditem.nftaddress, networkId: chainId});

        if (! foundnft.available) {

            return res.status(404).json({error: "NFT is not avilable"});

        }

        const productdesc = {
            itemid: foundnft.itemid,
            name: foundnft.name,
            tokenid: foundnft.nftid,
            address: foundnft.address
        };
        console.log(productdesc);

        const _product = await stripe.products.create({name: foundnft.name, active: true, metadata: productdesc});

        const _price = await stripe.prices.create({
            unit_amount: Math.round(price * 100),
            currency: 'usd',
            product: _product.id
        });

        const session = await stripe.checkout.sessions.create({
            customer: customer_id,
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price: _price.id,
                    quantity: quantity
                }
            ],
            success_url: success_URL,
            cancel_url: cancel_URL
        })

        return res.status(200).json({sessionid: session});

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Server Error"});
    }
};


const createPayment = async (req, res) => {
    console.log("create payment route reached")
    console.log(req.body)
    const {
        customer_id,
        name,
        card_ExpYear,
        card_ExpMonth,
        card_Number,
        card_CVC,
        billing_details,
        price
    } = req.body;
    try {

        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: card_Number,
                exp_month: card_ExpMonth,
                exp_year: card_ExpYear,
                cvc: card_CVC
            }
        });

        const attachpaymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, {customer: customer_id});

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price * 100),
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            },
            customer: customer_id,
            payment_method: attachpaymentMethod.id,
            setup_future_usage: 'off_session',
            description: "MUNDUM Fiat payment for NFT",
            shipping: {
                name: name,
                address: billing_details
            }
        });

        return res.status(200).json({paymentintent_id: paymentIntent, attachpaymentmethod: attachpaymentMethod.id, message: "Payment Intaited"});

    } catch (error) {
        console.log(error)
        return res.status(400).json({message: error.message});
    }
}

const confirmPaymentIntent = async (req, res) => {

    console.log("confirm payment route reached")
    const {customer_id, paymentintent_id, attachpaymentmethod, return_URL} = req.body;
    /*
    using axios confirmPaymentIntent will be called in handle payment function in client side and after with the response of this 
    payment intent if we get client secret key at the client side then we have to you handle card action/ handle a next action of stripe then after
    we'll check the response of success(redirect to success_URL) or fail(redirect to return_URL)
        */
    try {

        const paymentIntent = await stripe.paymentIntents.confirm(paymentintent_id, {
            payment_method: attachpaymentmethod,
            return_url: return_URL
        });

        if (paymentIntent.status === 'succeeded') {

            return res.status(200).json({message: 'Payment succeeded'});

        } else if (paymentIntent.status === 'requires_action') {

            return res.status(200).json({requiresAction: true, paymentKey: paymentIntent.client_secret});

        } else {

            return res.status(400).json({message: 'Payment failed'});

        }


    } catch (error) {
        console.log(error)
        return res.status(400).json({message: error.message});
    }
}

module.exports = {
    createCustomer,
    getPriceOfMaticUSD,
    createPayment,
    checkOut,
    confirmPaymentIntent
}
