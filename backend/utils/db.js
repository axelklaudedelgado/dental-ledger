const { Sequelize } = require('sequelize');
const config = require('./config.js');  

const sequelize = new Sequelize(
  config.development.database,    
  config.development.username,    
  config.development.password,   
  {
    host: config.development.host,  
    dialect: config.development.dialect, 
  }
); 

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('connected to the database');
  } catch (err) {
    console.log('failed to connect to the database');
    return process.exit(1);
  }

  return null;
}

module.exports = { connectToDatabase, sequelize }
