const mongoose = require("../db.js");

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  items: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: "MenuItems"
      },

      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  status: {
    type: String,
    required: true,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
orderSchema.set("toJSON", {
  virtuals: true
});
orderSchema.statics.calcTotal = (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

// order model
const Order = mongoose.model("Order", orderSchema);

const getAll = async () => {
  // populate each item
  const orders = await Order.find().populate("items.item");

  return orders;
};

const getOne = async (id) => {
  const order = await Order.findById(id).populate("items.item");
  return order;
};

const create = async (body) => {
  const order = await Order.create(body);
  return order;
};

const update = async (id, body) => {
  const order = await Order.findByIdAndUpdate(id, body, { new: true });
  return order;
};

const remove = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  return order.id;
};

const getByStatus = async (status) => {
  const orders = await Order.find({ status }).populate("items");
  return orders;
};

const totalSales = async () => {
  const orders = await Order.find().populate("items.item");
  const items = orders.map((order) => order.items);
  const sum = items
    .flat()
    .reduce(
      (total, element) => total + element.item.price * element.quantity,
      0
    );
  return { total: sum };
};

const totalSalesByDate = async (from, to) => {
  const orders = await Order.find({
    createdAt: {
      $gte: new Date(new Date(from).setHours(0o0, 0o0, 0o0)),
      $lt: new Date(new Date(to).setHours(23, 59, 59))
    }
  }).populate("items.item");
  const items = orders.map((order) => order.items);
  const sum = items
    .flat()
    .reduce(
      (total, element) => total + element.item.price * element.quantity,
      0
    );
  return { total: sum };
};

const getByStatusQuery = async (status) => {
  const orders = await Order.find({
    status: { $regex: status, $options: "i" }
  }).populate("items.item");
  return orders;
};

const getByStatusAndDate = async (status, from, to) => {
  const orders = await Order.find({
    status: { $regex: status, $options: "i" },
    createdAt: {
      $gte: new Date(new Date(from).setHours(0o0, 0o0, 0o0)),
      $lt: new Date(new Date(to).setHours(23, 59, 59))
    }
  }).populate("items.item");
  return orders;
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getByStatus,
  totalSales,
  totalSalesByDate,
  getByStatusQuery,
  getByStatusAndDate,
  Order
};
