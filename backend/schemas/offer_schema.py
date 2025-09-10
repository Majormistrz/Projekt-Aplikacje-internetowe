from marshmallow import Schema, fields, validate

from marshmallow import Schema, fields, validate

class OfferSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1))
    description = fields.Str(required=False)
    entry_price = fields.Float(required=True, validate=validate.Range(min=0))
    price_per_day = fields.Float(required=True, validate=validate.Range(min=0))
    category_id = fields.Int(required=True)
    seller_id = fields.Int(dump_only=True)
    available_quantity = fields.Int(required=True, validate=validate.Range(min=0))
    image = fields.Raw(required=False) 
    


class OfferCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    description = fields.Str(required=True)
    entry_price = fields.Float(required=True)
    price_per_day = fields.Float(required=True)
    category_id = fields.Int(required=True)
    seller_id = fields.Int(required=True)
    available_quantity = fields.Int(required=True, validate=validate.Range(min=0))




class OfferUpdateSchema(Schema):
    name = fields.Str()
    description = fields.Str()
    entry_price = fields.Float(validate=validate.Range(min=0.01))
    price_per_day = fields.Float(validate=validate.Range(min=0.01))
    category_id = fields.Int()
    available_quantity = fields.Int(validate=validate.Range(min=0))