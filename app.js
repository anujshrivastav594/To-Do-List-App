const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view-engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];// in js array can be constant and new items can be pushed but cant declared to be different arry

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

mongoose.connect("mongodb+srv://admin-anuj:Apfor%40594@cluster0.jvxhf70.mongodb.net/todolistDB");//@=%40(hex code for @)

const itemsSchema = new mongoose.Schema({
   name: String
})
const Item = mongoose.model("Item", itemsSchema);

const workitemsSchema = new mongoose.Schema({
  name: String
})
const workItem = mongoose.model("workItem", workitemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemsSchema]
})
const List = mongoose.model("List", listSchema);

const item1 = new Item ({
  name: "Welcome to your todolist"
})
const item2 = new Item ({
  name: "Hit the + button to add the new item."
})
const item3 = new Item ({
  name: "<-- Hit this to delete an item.>"
})

const defaultItems = [item1, item2, item3];


// Item.insertMany(defaultItems).then(function () { //updated stack over flow code
//   console.log("Successfully saved dafault items to DB.");
// }).catch(function (err) {
//   console.log(err);s
// });

app.get("/", function(req, res) {  

    Item.find().then((foundItems) => {
    // console.log(foundItems);

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems).then(function () { //updated stack over flow code
        console.log("Successfully saved dafault items to DB.");
      }).catch(function (err) {
        console.log(err);
      });

      res.redirect("/");

    } else {
      let day = date.getDate();
      res.render("list.ejs", {listTitle : day, newItems : foundItems});
    } 
   })

});

app.get("/work", function(req, res) {
  workItem.find().then((foundworkItems) => {
    res.render("list.ejs", {listTitle: "work", newItems: foundworkItems});
  })
})

app.get("/about", function(req, res) {
  res.render("about.ejs");
})

app.get("/contact", function(req, res) {
  res.render("contact.ejs");
})

app.get("/:customListName", function(req, res) {
  const customPageName = _.capitalize(req.params.customListName);

List.findOne({name: customPageName}).then((foundList) => {
  
  if(!foundList) {
       //create a new list

       // console.log("Doesn't Exist."); 
        const list = new List({
        name: customPageName,
        items: defaultItems
      })
      list.save();
      res.redirect("/" + customPageName);
  } else {
    //show an existing list

    // console.log("Exist.");
    res.render("list.ejs", {listTitle: foundList.name, newItems: foundList.items})
  }
 })

})

app.post("/", function(req, res) {

  const listName = req.body.list;
  const itemName = req.body.toDoitem;

  const newlistItem = new Item({
    name: itemName
   })

  if(listName === date.getDate()) { 
    
    newlistItem.save();
    res.redirect("/");

  } else if(listName === "work") { 
    const newlistItem = new workItem({
      name: itemName
    })
    newlistItem.save();
    res.redirect("/work");

  } else {
    List.findOne({name: listName}).then((foundList) => {
      
      foundList.items.push(newlistItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
})

app.post("/delete", function(req, res) {
  // console.log(req.body.checkbox);
  const checkedItem = req.body.checkbox;
  const pageName = req.body.pageName;

  if(pageName === date.getDate()) {
  Item.findByIdAndDelete(checkedItem)
  .exec()
  .then(result => {
    console.log("Delete successful", result);
  })
  .catch(error => {
    console.error("Error Deleting item:", error);
  });
  res.redirect("/");

  } else if(pageName === "work") {
    workItem.findByIdAndDelete(checkedItem)
    .exec()
    .then(result => {
      console.log("Delete successful", result);
    })
    .catch(error => {
      console.error("Error Deleting workitem:", error);
    });
    res.redirect("/work");
    
  } else {
    List.findOneAndUpdate({name: pageName}, {$pull: {items: {_id: checkedItem}}})
    .exec()
    .then(result => {
      console.log("Delete successful", result);
    })
    .catch(error => {
      console.error("Error Deleting:", error);
    });

    res.redirect("/" + pageName)
  }
  
})
app.listen(3000, function() {
    console.log("Server is running on port 3000");
});