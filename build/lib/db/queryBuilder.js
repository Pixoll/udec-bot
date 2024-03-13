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
    selectors;
    constructor(table) {
        super('SELECT', table);
        this.columns = new Set();
        this.selectors = [];
    }
    select(...columns) {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }
    where(selector) {
        this.selectors.push(selector);
        return this;
    }
    toString() {
        const columns = this.columns.size > 0 ? [...this.columns].join(', ') : '*';
        const where = this.selectors.length > 0
            ? 'WHERE ' + this.selectors.map(s => {
                const isNull = s.isNull ? 'IS NULL' : null;
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
    constructor(table) {
        super('INSERT INTO', table);
    }
    toString() {
        return '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9kYi9xdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUNYLFdBQVcsQ0FBUztJQUNwQixLQUFLLENBQVE7SUFFaEMsWUFBbUIsV0FBbUIsRUFBRSxLQUFZO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FHSjtBQVZELG9DQVVDO0FBa0JELE1BQWEsa0JBR1gsU0FBUSxZQUFtQjtJQUNSLE9BQU8sQ0FBOEI7SUFDckMsU0FBUyxDQUE2QztJQUV2RSxZQUFtQixLQUFZO1FBQzNCLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUFrQjtRQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUF5QixRQUE0QztRQUM3RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUEwRCxDQUFDLENBQUM7UUFDaEYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFFBQVE7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFB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