import { useEffect, useState } from "react";
import { Pj, PrCategory } from "./dataStructure";
import "./style.css";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useInterval } from "../API";

PrCategory.$("minecraft", "마인크래프트 개발", "img/minecraft.png")
    .Projects(
        Pj.$("Luminous RPG").Platform("MCBE").Images("img/games/test/test0.png", "img/games/test/test1.png", "img/games/test/test2.png").Description("루미너스 RPG는 높은 퀄리티를 자랑하는 반 오픈월드 액션 RPG 서버입니다.").Link("오픈채팅", ""),
        Pj.$("Valorant Addon").Platform("MCBE"),
    )

PrCategory.$("unity", "유니티 개발", "img/unity.png")
    .Projects(
        Pj.$("범근 러쉬").Platform("PC").Description("동아리 과제로 제작한 연출 연습을 위한 프로젝트 입니다."),
        Pj.$("Eucliwood Edge").Platform("PC/Mobile").Description("")
    )

function Project() {
    const [projectItem, SetProjectItem] = useState<JSX.Element>();
    const [categoryItem, SetCategoryItem] = useState<JSX.Element[]>([]);
    const [imgPage, SetImagePage] = useState(1);
    let category = "minecraft";
    let pjCode = 0;

    const [query, setQuery ] = useSearchParams();
    const section = query.get("sec")
    const project = query.get("pj")

    if (section) {
        category = section;
    }

    const pn = Number(project);

    if (!isNaN(pn)) {
        pjCode = pn;
    }

    if (project === null) {
        query.set("pj", "0");
        setQuery(query);
    }

    const SetSection = (sec: string)=>{
        query.set("sec", sec);
        setQuery(query);
    }

    useInterval(()=>{
        SetImagePage(imgPage+1);
        Update();
    }, 8000)

    const Update = ()=>{
        SetSection(category);

        const itms = PrCategory.data.map((v)=>
            <div className="category-item pointer hovertext" data-hover={v.name} id={"category-" + v.id} key={"category-" + v.id} onClick={
                ()=>{
                    category = v.id;
                    Update();
                }
            }>
                <img src={v.img}></img>
                {(category === v.id) ? <div className="category-selected"></div> : <></>}
            </div>
        );

        const sect = PrCategory.data.find((v)=>v.id === category);
        if (sect) {
            SetProjectItem(
                (
                    <div className="project_sec">
                        <p className="title">{sect.projects[pjCode].name}</p>
                        <p className="platform">{sect.projects[pjCode].platform}</p>
                        <img src={sect.projects[pjCode].img[0]} className={imgPage % 3 == 1 ? "imgNow" : imgPage % 3 == 2 ? "imgAfter" : "imgBefore"}></img>
                        <img src={sect.projects[pjCode].img[sect.projects[pjCode].img.length - 1]} className={imgPage % 3 == 2 ? "imgNow" : imgPage % 3 == 0 ? "imgAfter" : "imgBefore"}></img>
                        <img src={sect.projects[pjCode].img[1]} className={imgPage % 3 == 0 ? "imgNow" : imgPage % 3 == 1 ? "imgAfter" : "imgBefore"}></img>
                        <p className="descrip">{sect.projects[pjCode].description}</p>
                    </div>
                )
            )
        } else {
            SetProjectItem(
                (<></>)
            )
        }
        SetCategoryItem(itms);
    }

    useEffect(()=>{
        Update();
    }, [])
    return (
        <>
            <div className="category">
                {categoryItem}
            </div>
            <div>
                {projectItem}
            </div>
        </>
    )
}

export default Project;