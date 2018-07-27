const store = require('../store-image')();
const assert = require('assert');

describe('Test Store', ()=>{
	describe('Test Error', ()=>{
		it('No data', (done)=>{
			store.save('test.txt').then(res=>{
				done('Must be error')
			})
			.catch(err=>{
				if (err == 'No data') done();
				else done('False return '+err);
			})
		})
		it('Empty data input', (done)=>{
			store.add('', {})
			.then(err=>{
				if (err) done(err + "");
				else done();
			}).catch(err=>{
				done(err + "");
			})
		})
	})
	describe('Have data, but is not image data', ()=>{
		it('add data', (done)=>{
			store.add('asdasdasd', {})
			.then(res=>{
				if (res == false) done();
				else done('Must return false');
			}).catch(err=>{
				done(err);
			})
		})
		it('save data', (done)=>{
			store.add('asdasd').then(res=>{
				//will ignore res
				store.save('test.txt').then(resToSave=>{
					done("Must be throw")
				}).catch(err=>{
					done(); //because ignore add data, the data will be undefined in add()
				}) 
			})
			.catch(err=>{
				done("Why throw? " + err);
			})
		})
	})
})