"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQueryBuilder = exports.InsertQueryBuilder = exports.SelectQueryBuilder = exports.QueryBuilder = void 0;
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
            ? 'WHERE ' + this.filters.map(s => {
                const isNull = typeof s.isNull === 'undefined'
                    ? `IS${!s.isNull ? 'NOT ' : ''} NULL`
                    : null;
                const equality = s.equals ? `= ${parseQueryValue(s.equals)}`
                    : s.notEquals ? `!= ${parseQueryValue(s.notEquals)}`
                        : null;
                const lessComp = s.lessThan ? `< ${s.lessThan}`
                    : s.lessThanOrEqualTo ? `<= ${s.lessThanOrEqualTo}`
                        : null;
                const greaterComp = s.greaterThan ? `> ${s.greaterThan}`
                    : s.greaterThanOrEqualTo ? `>= ${s.greaterThanOrEqualTo}`
                        : null;
                const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
                if (filters.length === 0) {
                    throw new Error('Must specify at least one query filter.');
                }
                return `(${s.column} ${filters.join(` OR ${s.column} `)})`;
            }).join(' AND ')
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
        const columns = pairs.map(p => p[0]);
        const values = pairs.map(p => parseQueryValue(p[1]));
        return `${this.instruction} ${this.table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    }
}
exports.InsertQueryBuilder = InsertQueryBuilder;
class UpdateQueryBuilder extends QueryBuilder {
    constructor(table) {
        super('UPDATE', table);
    }
    toString() {
        return '';
    }
}
exports.UpdateQueryBuilder = UpdateQueryBuilder;
function parseQueryValue(value) {
    switch (typeof value) {
        case 'string':
            return `"${value.replace(/"/g, '\\"')}"`;
        case 'bigint':
            return value.toString().replace('n', '');
        default:
            return `${value}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9kYi9xdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUNYLFdBQVcsQ0FBUztJQUNwQixLQUFLLENBQVE7SUFFaEMsWUFBbUIsV0FBbUIsRUFBRSxLQUFZO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FHSjtBQVZELG9DQVVDO0FBb0JELE1BQWEsa0JBR1gsU0FBUSxZQUFtQjtJQUNSLE9BQU8sQ0FBOEI7SUFDckMsT0FBTyxDQUE2QztJQUVyRSxZQUFtQixLQUFZO1FBQzNCLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUFrQjtRQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUF5QixNQUEwQztRQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUF3RCxDQUFDLENBQUM7UUFDNUUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFFBQVE7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFB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