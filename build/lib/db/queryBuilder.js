"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQueryValue = exports.DeleteQueryBuilder = exports.UpdateQueryBuilder = exports.InsertQueryBuilder = exports.SelectQueryBuilder = exports.QueryBuilder = void 0;
class QueryBuilder {
    instruction;
    table;
    constructor(instruction, table) {
        this.instruction = instruction;
        this.table = table;
    }
}
exports.QueryBuilder = QueryBuilder;
class SelectQueryBuilder extends QueryBuilder {
    columns;
    filters;
    constructor(table) {
        super('SELECT', table);
        this.columns = new Set();
        this.filters = [];
    }
    select(...columns) {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }
    where(filter) {
        this.filters.push(filter);
        return this;
    }
    toString() {
        const columns = this.columns.size > 0 ? [...this.columns].join(', ') : '*';
        const where = this.filters.length > 0
            ? 'WHERE ' + parseFilters(this.filters)
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`.replace(/ ;$/, ';');
    }
}
exports.SelectQueryBuilder = SelectQueryBuilder;
class InsertQueryBuilder extends QueryBuilder {
    pairs;
    constructor(table) {
        super('INSERT INTO', table);
        this.pairs = null;
    }
    values(pairs) {
        this.pairs = pairs;
        return this;
    }
    toString() {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }
        const columns = pairs.map(p => p[0]).join(', ');
        const values = pairs.map(p => parseQueryValue(p[1])).join(', ');
        return `${this.instruction} ${this.table.name} (${columns}) VALUES (${values});`;
    }
}
exports.InsertQueryBuilder = InsertQueryBuilder;
class UpdateQueryBuilder extends QueryBuilder {
    pairs;
    filters;
    constructor(table) {
        super('UPDATE', table);
        this.pairs = null;
        this.filters = [];
    }
    values(pairs) {
        this.pairs = pairs;
        return this;
    }
    where(filter) {
        this.filters.push(filter);
        return this;
    }
    toString() {
        const pairs = Object.entries(this.pairs ?? {});
        if (pairs.length === 0) {
            throw new Error('At least one (column, value) pair must be specified.');
        }
        const set = pairs.map(([k, v]) => `${k} = ${parseQueryValue(v)}`).join(', ');
        const where = this.filters.length > 0
            ? 'WHERE ' + parseFilters(this.filters)
            : '';
        return `${this.instruction} ${this.table.name} SET ${set} ${where};`.replace(/ ;$/, ';');
    }
}
exports.UpdateQueryBuilder = UpdateQueryBuilder;
class DeleteQueryBuilder extends QueryBuilder {
    filters;
    constructor(table) {
        super('DELETE FROM', table);
        this.filters = [];
    }
    where(filter) {
        this.filters.push(filter);
        return this;
    }
    toString() {
        if (this.filters.length === 0) {
            throw new Error('At least one filter must be specified.');
        }
        const where = parseFilters(this.filters);
        return `${this.instruction} ${this.table.name} WHERE ${where};`.replace(/ ;$/, ';');
    }
}
exports.DeleteQueryBuilder = DeleteQueryBuilder;
function parseQueryValue(value) {
    switch (typeof value) {
        case 'string':
            return `'${value.replace(/'/g, '\\\'')}'`;
        case 'bigint':
            return value.toString().replace('n', '');
        default:
            return `${value}`;
    }
}
exports.parseQueryValue = parseQueryValue;
function parseFilters(filters) {
    return filters.map(f => {
        const isNull = typeof f.isNull !== 'undefined'
            ? `IS${!f.isNull ? ' NOT' : ''} NULL`
            : null;
        const equality = f.equals ? `= ${parseQueryValue(f.equals)}`
            : f.notEquals ? `!= ${parseQueryValue(f.notEquals)}`
                : null;
        const lessComp = f.lessThan ? `< ${f.lessThan}`
            : f.lessThanOrEqualTo ? `<= ${f.lessThanOrEqualTo}`
                : null;
        const greaterComp = f.greaterThan ? `> ${f.greaterThan}`
            : f.greaterThanOrEqualTo ? `>= ${f.greaterThanOrEqualTo}`
                : null;
        const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
        if (filters.length === 0) {
            throw new Error('Must specify at least one query filter.');
        }
        return `(${f.column} ${filters.join(` OR ${f.column} `)})`;
    }).join(' AND ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9kYi9xdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUNYLFdBQVcsQ0FBUztJQUNwQixLQUFLLENBQVE7SUFFaEMsWUFBbUIsV0FBbUIsRUFBRSxLQUFZO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FHSjtBQVZELG9DQVVDO0FBb0JELE1BQWEsa0JBR1gsU0FBUSxZQUFtQjtJQUNSLE9BQU8sQ0FBOEI7SUFDckMsT0FBTyxDQUE2QztJQUVyRSxZQUFtQixLQUFZO1FBQzNCLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUFrQjtRQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUF5QixNQUEwQztRQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUF3RCxDQUFDLENBQUM7UUFDNUUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFFBQVE7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFB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