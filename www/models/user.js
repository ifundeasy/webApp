const bluebird = require('bluebird');
const bcrypt = require('bcrypt');
//
bluebird.promisifyAll(bcrypt);
//
module.exports = function (mongoose, opts) {
	let regEx = opts.regEx;
	let getCode4 = opts.getCode4;
	let factory = opts.factory;
	//
	let Schema = mongoose.Schema;
	let userSchema = new Schema({
		name: {
			first: String,
			last: String
		},
		username: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		password: {
			type: String,
			match: [regEx.password, '{VALUE} is not a valid password format!'],
			required: true
		},
		email : {
			value : {
				type : String,
				trim : true,
				lowercase : true,
				match : [regEx.email, '{VALUE} is not a valid email address!'],
				unique : true,
				required : true
			},
			verifyUrl : String,
			verified : {type : Boolean, default : false}
		},
		phone : {
			value : {
				type : String,
				trim : true,
				lowercase : true,
				//v = v.replace(/[\(\)\+\-\s]/g, "");
				match : [regEx.phone, '{VALUE} is not a valid phone number!'],
				unique : false,
				required : false
			},
			verifyCode : String,
			verified : {type : Boolean, default : false}
		},
		"groups._id": {
			ref: 'group',
			type: Schema.Types.ObjectId,
			required: true
		}
	});
	//
	userSchema.pre('update', function (next) {
		let older = {};
		let error = undefined;
		let user = this._update.$set;
		let prom = this.findOne(this._conditions).lean();
		let handler = function (e) {
			if (e) {
				error = e;
				prom.cancel();
			} else {
				return next(error);
			}
		};
		prom.catch(handler).then(function (docs) {
			older = (docs);
			if (!user["password"]) prom.cancel();
			else {
				return bcrypt.genSaltAsync(factory)
			}
		})
		.catch(handler).then(function (salt) {
			return bcrypt.hashAsync(user.password, salt)
		})
		.catch(handler).then(function (hash) {
			user.password = hash;
		})
		.finally(handler);
	});
	userSchema.pre('save', function (next) {
		let user = this;
		if (user.phone.value) user.phone.value = user.phone.value.replace(/[\(\)\+\-\s]/g, "");
		if (!user.isModified('password')) return next();
		//
		let saltVar = undefined, error = undefined;
		let prom = bcrypt.genSaltAsync(factory);
		let handler = function (e) {
			if (e) {
				error = e;
				prom.cancel();
			} else {
				return next(error);
			}
		};
		
		prom.catch(handler).then(function (salt) {
			saltVar = salt;
			return bcrypt.hashAsync(user.password, salt)
		})
		.catch(handler).then(function (hash) {
			let url = user.email.value + new Date().getTime().toString(36);
			user.password = hash;
			if (user.phone.value) user.phone.verifyCode = getCode4();
			if (user.phone.value) user.phone.verified = false;
			user.email.verified = false;
			return bcrypt.hashAsync(url, saltVar);
		})
		.catch(handler).then(function (hash) {
			user.email.verifyUrl = hash;
		})
		.finally(handler)
	});
	userSchema.methods.pwdCheck = function (input, cb) {
		bcrypt.compareAsync(input, this.password).catch(function (err) {
			return cb(err, null);
		}).then(function (match) {
			return cb(null, match);
		});
	};
	//
	return mongoose.model('user', userSchema);
};