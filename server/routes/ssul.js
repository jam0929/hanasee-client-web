/*jslint node: true */
'use strict';
exports.ssuls = function(req, res) {
  res.json(200,
    {
      "Ssuls": [
        {
          "author": "test@test.com",
          "viewCount": "1",
          "tags": [
            "EXO",
            "엑소"
          ],
          "title": "엑소한테 테스트한 썰 1편",
          "created": "1394092924580",
          "updated": "1394092924580",
          "totalViewCount": "0",
          "status": "onair",
          "description": "엑소한테 테스트했던 썰 씀"
        },
        {
          "author": "test@test.com",
          "viewCount": "2",
          "tags": [
            "EXO",
            "엑소"
          ],
          "title": "엑소한테 테스트한 썰 2편",
          "created": "1394092924581",
          "updated": "1394092924581",
          "totalViewCount": "1",
          "status": "onair",
          "description": "엑소한테 테스트했던 썰 씀"
        },
        {
          "author": "test@test.com",
          "viewCount": "3",
          "tags": [
            "EXO",
            "엑소"
          ],
          "title": "엑소한테 테스트한 썰 3편",
          "created": "1394092924582",
          "updated": "1394092924582",
          "totalViewCount": "0",
          "status": "onair",
          "description": "엑소한테 테스트했던 썰 씀"
        }
      ],
      "LastEvaluatedKey": {
          "author": {
            "S": "test@test.com"
          },
          "status": {
            "S": "announced"
          },
          "viewCount": {
            "N": "0"
          },
          "created": {
            "N": "1394092924580"
          }
      }
    }
  );
};

exports.ssul = function(req, res) {
  res.json(200,
    {
      "Ssul": {
        "author": "test@test.com",
        "viewCount": "1",
        "tags": [
          "EXO",
          "엑소"
        ],
        "title": "엑소한테 테스트한 썰 1편",
        "created": "1394092924580",
        "updated": "1394092924580",
        "totalViewCount": "0",
        "status": "onair",
        "description": "엑소한테 테스트했던 썰 씀"
      },
      "LastEvaluatedKey": {
        "author": {
          "S": "test@test.com"
        },
        "status": {
          "S": "announced"
        },
        "viewCount": {
          "N": "0"
        },
        "created": {
          "N": "1394092924580"
        }
      }
    }
  );
};