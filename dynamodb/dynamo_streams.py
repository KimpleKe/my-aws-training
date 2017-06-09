#!/usr/bin/env python

import json

testevent = {
    "Records": [
        {
            "dynamodb": {
                "NewImage": {
                    "Item": {
                        "S": "Hat",
                    },
                    "Price": {
                        "N": "19.95",
                    }
                }
            }
        }
    ]
}

def lambda_handler(event, context):
    for record in event['Records']:
        item = record['dynamodb']['NewImage']['Item']['S']
        price = record['dynamodb']['NewImage']['Price']['N']
        print("You added an item: '%s' with price %f" % (item, float(price)))

if __name__ == "__main__":
    lambda_handler(testevent, {})
