const Query = function(table_name, db)
{
	this.query = '';
	this.table = table_name;
	this.db = db;

	this.find = (q)=>{
		this.query = `SELECT * FROM ${this.table}`;

		if (q) this.query += " WHERE "+q;
		return this;
	}

	this.insert = (q = {})=>{
		this.query = `INSERT INTO ${this.table} (`;
		for (const field in q)
		{
			this.query += field + ", ";
		}
		this.query += ") VALUES (";
		for (const field in q)
		{
			let val = q[field];
			if (typeof val == 'string') {
				val = `'${val}'`;
			}

			this.query += val + ", ";
		}
		this.query += ')';
	}

	this.and = (q)=>{
		this.query += ' AND '+q;
		return this;
	}

	this.or = (q)=>{
		this.query += ' OR '+q;
		return this;
	}

	this.skip = (offset)=>{
		this.query += ' OFFSET '+offset;
		return this;
	}

	this.limit = (limit)=>{
		this.query += ' LIMIT '+limit;
		return this;
	}

	this.exec = async (callback = (err, rows)=>any)=>{
		const {rows} = await this.db.query(this.query);
		this.query = "";
		callback(null, rows);
		return rows;
	}

	return this;
}

module.exports = Query;