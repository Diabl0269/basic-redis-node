import express from "express";
import exphbs from "express-handlebars";
import methodOverride from "method-override";
import redis from "redis";

const client = redis.createClient();

client.on("connect", () => {
  console.log("Conencted to redis");
});

const port = 3000;

const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.json(), express.urlencoded({ extended: false }));

app.use(methodOverride("_method"));

// Main page
app.get("/", (req, res, next) => {
  res.render("searchusers");
});

// Add user page
app.get("/user/add", (req, res, next) => {
  res.render("adduser");
});

// Remove user
app.delete("/user/delete/:id", (req, res, next) => {
  client.del(req.params.id);
  res.redirect("/");
});

// Add new user
app.post("/user/add", (req, res, next) => {
  const { id, first_name, last_name, email, phone } = req.body;
  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    (err, replay) => {
      if (err) {
        console.log("err", err);
      }
      console.log("replay", replay);
      res.redirect("/");
    }
  );
});

// Get user data
app.post("/user/search", (req, res, next) => {
  const { id } = req.body;

  client.hgetall(id, (err, obj) => {
    if (!obj) {
      return res.render("searchusers", {
        error: "User does not exist",
      });
    }
    obj.id = id;
    res.render("details", {
      user: obj,
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
