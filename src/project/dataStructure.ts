export class PrCategory {
    static data: PrCategory[] = [];
    readonly projects: Pj[];

    constructor(
        public id: string,
        public name: string,
        public img: string,
    ) {
        this.projects = [];

        PrCategory.data.push(this);
    }

    static $(id: string, name: string, img: string): PrCategory {
        return new PrCategory(id, name, img);
    }

    Projects(...pj: Pj[]) {
        this.projects.push(...pj);
    }
}

interface link {
    name: string;
    url: string;
}

export class Pj {
    img: string[] = [];
    platform?: string;
    github?: string;
    youtube?: string;
    description?: string;
    links: link[] = [];
    docs?: string;
    constructor (
        public name: string,
    ) {}

    static $(name: string): Pj {
        return new Pj(name);
    }

    Platform(str: string): Pj {
        this.platform = str;
        return this;
    }

    Description(str: string): Pj {
        this.description = str;
        return this;
    }

    Images(...imgs: string[]): Pj {
        this.img = imgs;
        return this;
    }

    Github(url: string): Pj {
        this.github = url;
        return this;
    }

    Video(url: string): Pj {
        this.youtube = url;
        return this;
    }

    Docs(url: string): Pj {
        this.docs = url;
        return this;
    }

    Link(name: string, url: string): Pj {
        this.links.push(
            {
                name,
                url,
            }
        );

        return this;
    }
}