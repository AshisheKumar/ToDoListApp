//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ashishkumarr1108:Tarang123@cluster0.0gil2nn.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to Ur's to-do-list"
});

const item2 = new Item({
  name:"Enter ur's input and hit + button to add"
});

const item3 = new Item({
  name:"<--Hit this to delete items"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items:[itemSchema]
};

const List = mongoose.model("List" , listSchema );


app.get("/", function(req, res) {


  Item.find({},function(err,founditems)
  {
    if(founditems.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Items added...");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today",newListItems: founditems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName ==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err,foundList)
  {
  foundList.items.push(item);
foundList.save();
res.redirect("/" + listName);
  })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName==="Today")
{
  Item.findByIdAndRemove(checkedItemId,function(err)
{  if(!err)
  {
    console.log(checkedItemId+" Deleted");
    res.redirect("/");
  }

});
}
else{

  List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedItemId}}},function(err,foundList)
{
  if(!err)
  {
    res.redirect("/" + listName);
  }
});

}
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName",function(req,res)
{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName},function(err,result){

    if(!err){
      if(!result)
      {//Create a new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
      else{
        //Show an existing list
        res.render("list",{listTitle:result.name,newListItems:result.items});
      }
    }

  });
});





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
