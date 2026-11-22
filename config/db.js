const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    // Some networks' DNS servers return bad answers to the SRV lookup that
    // mongodb+srv:// needs (querySrv EBADRESP). DNS_SERVERS=8.8.8.8,1.1.1.1 works around it.
    if (process.env.DNS_SERVERS) {
        dns.setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()));
    }
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
}

module.exports = connectDB;