/*jslint node: true */
'use strict';
exports.toks = function(req, res) {
  res.json(200,
    {
      "Toks": [
        {
          "created": "1394092924580",
          "content": "어느날 엑소랑 만남"
        },
        {
          "created": "1394092925580",
          "content": "나한테 말검"
        },
        {
          "created": "1394092926580",
          "content": "러브러브함 굿"
        }
      ],
      "LastEvaluatedKey": {
          "author": {
            "S": "test@test.com"
          },
          "created": {
            "N": "1394092924580"
          }
      }
    }
  );
};