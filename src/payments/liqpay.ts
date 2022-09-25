'use strict';
/**
 * Liqpay Payment Module
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 *
 * @module          liqpay
 * @category        LiqPay
 * @package         liqpay/liqpay
 * @version         3.1
 * @author          Liqpay
 * @copyright       Copyright (c) 2014 Liqpay
 * @license         http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 *
 * EXTENSION INFORMATION
 *
 * LIQPAY API       https://www.liqpay.ua/documentation/uk
 *
 */

// const request = require('request');
import request from 'request'
import * as crypto from "crypto";

/**
 * Creates object with helpers for accessing to Liqpay API
 *
 * @param {string} public_key
 * @param {string} private_key
 *
 * @throws {InvalidArgumentException}
 */
export default function LiqPay(public_key, private_key) {
    /**
     * Call API
     *
     * @param {string} host
     */

    const host = "https://www.liqpay.ua/api/";

    /**
     * Call API
     *
     * @param {string} path
     * @param {object} params
     * @param {function} callback
     */
    const api = function api(path, params, callback, callbackerr) {
        if (!params.version) {
            throw new Error('version is' +
                'null');
        }

        params.public_key = public_key;
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = str_to_sign(private_key + data + private_key);

        request.post(host + path, { form: { data: data, signature: signature } }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(JSON.parse(body))
                } else {
                    callbackerr(error, response);
                }
            }
        );
    };

    /**
     * cnb_form
     *
     * @param {object} params
     *
     * @return {string}
     *
     * @throws {InvalidArgumentException}
     */
    const cnb_form = function cnb_form(params) {
        let language = "ru";

        if (params.language) {
            language = params.language;
        }

        params = cnb_params(params);
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = str_to_sign(private_key + data + private_key);

        return '<form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">' +
            '<input type="hidden" name="data" value="' + data + '" />' +
            '<input type="hidden" name="signature" value="' + signature + '" />' +
            '<input type="image" src="//static.liqpay.ua/buttons/p1' + language + '.radius.png" name="btn_text" />' +
            '</form>';
    };

    /**
     * cnb_signature
     *
     * @param {object} params
     *
     * @return {string}
     *
     * @throws {InvalidArgumentException}
     */
    const cnb_signature = function cnb_signature(params) {
        params = cnb_params(params);
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        return str_to_sign(private_key + data + private_key);
    };

    /**
     * cnb_params
     *
     * @param {object} params
     *
     * @return {object} params
     *
     * @throws {InvalidArgumentException}
     */
    const cnb_params = function cnb_params(params) {
        params.public_key = public_key;

        if (!params.version) {
            throw new Error('version is null');
        }
        if (!params.amount) {
            throw new Error('amount is null');
        }
        if (!params.currency) {
            throw new Error('currency is null');
        }
        if (!params.description) {
            throw new Error('description is null');
        }

        return params;
    };

    /**
     * str_to_sign
     *
     * @param {string} str
     *
     * @return {string}
     */
    const str_to_sign = function str_to_sign(str) {
        const sha1 = crypto.createHash('sha1');
        sha1.update(str);
        return sha1.digest('base64');
    };

    /**
     * Return Form Object
     *
     * @param {object} params
     *
     * @returns {{ data: string, signature: string }} Form Object
     */
    const cnb_object = function cnb_object(params) {
        let language = "ru";

        if (params.language) {
            language = params.language;
        }

        params = cnb_params(params);
        const data = Buffer.from(JSON.stringify(params)).toString('base64');
        const signature = str_to_sign(private_key + data + private_key);

        return { data: data, signature: signature };
    };

    return this;
}