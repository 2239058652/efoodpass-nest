export class PageResultDto<T> {
    constructor(
        public readonly list: T[],
        public readonly total: number,
        public readonly pageNum: number,
        public readonly pageSize: number,
    ) {}
}
