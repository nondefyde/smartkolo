/**
 * Created by Ekaruztech on 7/18/2016.
 */

exports.do =  function(meta,data)
{
        var response  = {};
        response._meta = meta;
    if(meta.code) {
        meta.status_code = meta.code;
        delete meta.code;
    }
    if(data) {
        response.data = data;
    }
    return response;
};


exports.general =  function(info)
{
    var response = {};
    if(info.statusCode)
    {
        response.status_code = info.statusCode;
    }
    if(info.success)
    {
        meta.success = info.success;
    }
    if(info.message)
    {
        meta.message = info.message;
    }
    if(info.errors)
    {
        response.errors = info.errors;
    }
    if(info.extra)
    {
        response.extra = info.extra;
    }
    return response;
};


function statusToMessage(statusCode)
{
    var message = "";
    if(statusCode)
    {
        switch (statusCode)
        {
            case 200:
                message = "Request OK";
                break;
            case 201:
                message = "New resource created";
                break;
            case 404:
                message = "Resource not found";
                break;
            case 401:
                message = "Unauthorized Request";
                break;
            case 400:
                message = "Bad request";
                break;
            case 503:
                message = "Internal server error"
        }
    }

    return message;
}
