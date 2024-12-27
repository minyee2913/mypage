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
    download?: string;
    version?: string;
    constructor (
        public id: string,
        public name: string,
    ) {}

    static $(id: string, name: string): Pj {
        return new Pj(id, name);
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
    Download(link: string): Pj {
        this.download = link;
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