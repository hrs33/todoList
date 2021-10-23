//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { addListener } = require("nodemon");

const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Harsh:Admin123@cluster0.82dti.mongodb.net/todolistDB", { useNewUrlParser: true }, { useUnifiedTopology: true });

//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your Todo list"
});

const item2 = new Item({
    name: "Hit + button to add item"
});

const item3 = new Item({
    name: "Hit <-- to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItems, function(err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully added items.");
//     }
// });
// Item.find(function(err, result) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(result);
//     }
// });

// Item.deleteMany({
//     _id: "ObjectId('6123c1bb23b35323444e0022')",
//     _id: "ObjectId('6123c1bb23b35323444e0021')",
//     _id: "ObjectId('6123c1bb23b35323444e0020')",
//     _id: "ObjectId('6123c1deb8652f297060c3ba')"
// });

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })

                list.save();

                res.redirect("/" + customListName);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    })
});

app.get("/", function(req, res) {

    Item.find(function(err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added items.");
                }
            });
            res.redirect("/");
        } else {

            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });

});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});
app.post("/delete", function(req, res) {

    const item = req.body.checkbox;
    const listName = req.body.listName

    if (listName === "Today") {
        Item.find({ _id: item }).remove(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("successfully removed.");
            }
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: item } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }



});
app.get("/work", function(req, res) {
    res.render("list", { listTitle: "Work List", newListItems: defaultItems });
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function() {
    console.log("Server started on port 3000");
});