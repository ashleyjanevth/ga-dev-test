const Router = require('@koa/router');
const router = new Router();

const lrProperty = require('./models/lrProperty.js');

router.param('lrPropertyId', async (id, ctx, next) =>
{
	ctx.lrProperty = await new lrProperty({id: id}).fetch({withRelated: ['lrTransactions'], require: false});

	if(! ctx.lrProperty)
	{
		ctx.status = 404;
		return ctx.body = {error: true, msg: "LRProperty not found", code: "PROPERTY_NOT_FOUND"};
	}

	return next();

})
.get('/', async (ctx, next) => 
{
	return ctx.body = "I'm alive!";
})
.get('/lrProperty/:lrPropertyId', async (ctx, next) => 
{
	return ctx.body = {success: true, lrProperty: ctx.lrProperty.toJSON()};
})
.get('/search', async (ctx, next) =>
{
	const {postcode, street, id, page} = ctx.query;

	let outcode = null, incode = null;

	if(id)
		return ctx.redirect('/lrProperty/' + id);

	if(postcode)
	{
		// check valid postcode
		const validPostcodeReg = new RegExp("^(([A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1})[ ]*([0-9]{1}[A-Z]{2}))$", "i"),
			validOutcodeReg = new RegExp("^([A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1})$", "i");

		if(postcode.match(validPostcodeReg))
		{
			const matches = postcode.match(validPostcodeReg);

			outcode = matches[2];
			incode = matches[3];
		}
		else if(postcode.match(validOutcodeReg))
		{
			outcode = postcode;
		}
		else
		{
			return ctx.body = {error: true, msg: "The specified postcode isn't valid", code: "BAD_POSTCODE"};
		}
	}

	if((! street) && (! outcode) && (! incode))
		return ctx.body = {error: true, msg: "No search parameters specified", code: "NO_PARAMS"};

	const lrProperties = await new lrProperty().query(qb => 
	{
		if(outcode)
			qb.where("outcode", outcode.toUpperCase());

		if(incode)
			qb.where("incode", incode.toUpperCase());

		if(street)
			qb.where("street", "LIKE", "%" + street + "%");

	})
	.fetchPage({withRelated: ['lrTransactions'], require: false, pageSize: 10, page: page || 1});

	return ctx.body = {success: true, lrProperties: lrProperties.toJSON(), pagination: lrProperties.pagination};
})


module.exports = (app) =>
{
	app
	.use(router.routes())
	.use(router.allowedMethods());
};
