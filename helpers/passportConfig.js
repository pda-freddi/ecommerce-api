const db = require("../database/index.js");
const bcrypt = require("bcrypt");

const verifyUser = async (email, password, done) => {
  try {
    const { rows } = await db.query("SELECT * FROM customer WHERE email = $1", [email]);
    if (rows.length === 0) {
      return done(null, false); 
    }

    const user = rows[0];
    const verifyPassword = await bcrypt.compare(password, user.password);
    // const verifyPassword = password === user.password;

    if (!verifyPassword) {
      return done(null, false, { message: "Incorrect e-mail or password" });
    } else {
      return done(null, user);
    }
    
  } catch (error) {
    return done(error);
  }
};

const serializeUser = (user, done) => {
  done(null, { id: user.id });
};

const deserializeUser = async (user, done) => {
  // TO DO: VERIFY WHAT CUSTOMER DATA WE ACTUALLY NEED TO DESERIALIZE FOR FURTHER USE IN THE APP
  try {
    const { rows } = await db.query("SELECT * FROM customer WHERE id = $1", [user.id]);
    done(null, rows[0]);
  } catch(e) {
    console.log(e);
  }
};

module.exports = {
  verifyUser,
  serializeUser,
  deserializeUser
}