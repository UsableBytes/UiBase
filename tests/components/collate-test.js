/* global describe, expect, it */

'use strict';

var ub = require('uibase');
var Collate = require('comp.Collate');

describe('Collate', function() {

    it('should extend from Component', function() {
        var op = function(acc, val) { return acc + val; };
        var collate = new Collate({ seed: 1, op: op });

        expect(collate instanceof ub.Component).to.equal(true);
    });

    it('should throw error if seed is not passed as configuration', function() {
        expect(function() {
            new Collate({ op: function() {} });
        }).to.throw();
    });

    it('should throw error if op is not passed as configuration or it is not a function', function() {
        expect(function() {
            new Collate({ seed: 1 });
        }).to.throw();

        expect(function() {
            new Collate({ seed: 1, op: '' });
        }).to.throw();
    });

    it('should be able to reduce multiple values to one', function(done) {
        var op = function(acc, val) { return acc + val; },
            collate = new Collate({ seed: 1, op: op });

        var input = new ub.Observable(function(observer) {
            this.write = function(val) { observer.onNext(val); };
        });

        input.subscribe(collate.inputs.input);

        input.write(2);
        input.write(3);

        var iter = 0;

        collate.outputs.output.subscribe(new ub.Observer(function(val) {
            iter += 1;
            if (iter === 2) {
                expect(val).to.equal(6);
                done();
            }
        }));

    });

    it('should reset state when reset input is triggered', function(done) {
        var op = function(acc, val) { return acc + val; },
            collate = new Collate({ seed: 1, op: op });

        var input = new ub.Observable(function(observer) {
            this.write = function(val) { observer.onNext(val); };
        });

        input.subscribe(collate.inputs.input);

        var iter = 0;
        var isReset = false;

        collate.outputs.output.subscribe(new ub.Observer(function(val) {
            iter += 1;
            if (iter === 2 && !isReset) {
                expect(val).to.equal(6);
                iter = 0;
                rstInput.write(true);
                input.write(2);
                input.write(3);
                input.write(4);
            } else if (iter === 4 && isReset) {
                expect(val).to.equal(10);
                done();
            }
        }));

        input.write(2);
        input.write(3);

        var rstInput = new ub.Observable(function(observer) {
            this.write = function(val) {
                observer.onNext(val);
                isReset = true;
            };
        });

        rstInput.subscribe(collate.inputs.reset);
    });

});
