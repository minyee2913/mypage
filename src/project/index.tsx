import { useEffect, useRef, useState } from "react";
import { Pj, PrCategory } from "./dataStructure";
import "./style.css";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { useInterval } from "../API";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";

PrCategory.$("minecraft", "마인크래프트 개발", "img/minecraft.png")
    .Projects(
        Pj.$("luminous", "Luminous RPG").Platform("MCBE").Images("img/games/luminous/lumi0.gif", "img/games/luminous/lumi1.png", "img/games/luminous/lumi2.png").Description("루미너스 RPG는 높은 퀄리티를 자랑하는 반 오픈월드 액션 RPG 서버입니다.").Docs("https://luminous-rpg.notion.site/146ab655c564453c8ce716dc37aabda6").Video("https://youtube.com/playlist?list=PL8M1DnGkh0qNDJc4cs4UIvycqQP5NVUkv&si=lRQbt0WfKO5slNPV"),
        Pj.$("valorant", "Valorant Addon").Platform("MCBE").Description("발로란트를 마인크래프트에서 구현한 애드온 입니다.").Github("https://github.com/minyee2913/valorant-addon"),
    )

PrCategory.$("unity", "유니티 개발", "img/unity.png")
    .Projects(
        //Pj.$("bum", "범근 러쉬").Platform("PC").Description("동아리 과제로 제작한 연출 연습을 위한 프로젝트 입니다."),
        Pj.$("eucliwood", "Eucliwood Edge").Platform("PC/Mobile").Description("횡스크롤과 타일 전투가 엮인 로그라이트 게임"),
    )

function Project() {
    const [projectItem, SetProjectItem] = useState<JSX.Element>();
    const [categoryItem, SetCategoryItem] = useState<JSX.Element[]>([]);
    const [modalImg, setImg] = useState("");
    const [isModal, SetModal] = useState(false);
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
    } else {
        const sect = PrCategory.data.find((v)=>v.id === category);
        if (sect) {
            const f = sect.projects.find((v)=>v.id === project)

            if (f) {
                pjCode = sect.projects.indexOf(f)
            }
        }
    }

    if (project === null) {
        query.set("pj", pjCode.toString());
        setQuery(query);
    }

    const SetSection = (sec: string)=>{
        query.set("sec", sec);
        setQuery(query);
    }

    useInterval(()=>{
        SetImagePage((imgPage+1) % 3);
        Update();
    }, 8000);

    const OpenModal = ()=>{
        SetModal(true);
    }

    const CloseModal = ()=>{
        SetModal(false);
    }

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

        const OnClickImg = (element: HTMLImageElement)=>{
            setImg(element.src);
            OpenModal();
        }

        const sect = PrCategory.data.find((v)=>v.id === category);
        if (sect) {
            SetProjectItem(
                (
                    <div className={"project_sec"}>
                        <p className="title">{sect.projects[pjCode].name}</p>
                        <p className="platform">{sect.projects[pjCode].platform}</p>
                        <img src={sect.projects[pjCode].img[0]} className={imgPage % 3 == 1 ? "imgNow" : imgPage % 3 == 2 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                            OnClickImg(r.currentTarget);
                        }}></img>
                        <img src={sect.projects[pjCode].img[sect.projects[pjCode].img.length - 1]} className={imgPage % 3 == 2 ? "imgNow" : imgPage % 3 == 0 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                            OnClickImg(r.currentTarget);
                        }}></img>
                        <img src={sect.projects[pjCode].img[1]} className={imgPage % 3 == 0 ? "imgNow" : imgPage % 3 == 1 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                            OnClickImg(r.currentTarget);
                        }}></img>
                        <div className="buttons">
                            {sect.projects[pjCode].docs ? <a href={sect.projects[pjCode].docs} target="_blank" className="btn hovertext pointer" data-hover="기획 / 문서">
                                <img src="img/docs.png"></img>
                            </a> : <></>}
                            {sect.projects[pjCode].youtube ? <a href={sect.projects[pjCode].youtube} target="_blank" className="btn hovertext pointer" data-hover="유튜브 영상">
                                <img src="img/youtube.png"></img>
                            </a> : <></>}
                            {sect.projects[pjCode].github ? <a href={sect.projects[pjCode].github} target="_blank" className="btn hovertext pointer" data-hover="깃허브">
                                <img src="img/github.png"></img>
                            </a> : <></>}
                            {sect.projects[pjCode].download ? <a href={sect.projects[pjCode].download} target="_blank" className="btn hovertext pointer" data-hover="다운로드">
                                <img src="img/download.png"></img>
                            </a> : <></>}
                        </div>
                        <CopyToClipboard text={`https://human.minyee2913.net/project?pj=${sect.projects[pjCode].id}&sec=${section}`} onCopy={()=>{alert("클립보드에 복사 되었습니다!")}}>
                            <div className="share_btn hovertext pointer" data-hover="공유">
                                    <img src="img/import.png"></img>
                            </div>
                        </CopyToClipboard>
                        <p className="descrip">{sect.projects[pjCode].description}</p>
                        {pjCode+1 < sect.projects.length && pjCode > 0 ? (<img id='ar2' src="img/down_arrow.png" className="arrow" onClick={()=>{
                            pjCode++;

                            query.set("pj", pjCode.toString());
                            setQuery(query);

                            SetProjectItem(
                                (<></>)
                            )

                            setTimeout(()=>{
                                Update();
                            }, 200);
                        }}></img>
                        ) : (<></>)}
                        <img id={(pjCode > 0 && pjCode+1 < sect.projects.length ? "ar1" : "ar0")} src={pjCode > 0 ? "img/up_arrow.png" : "img/down_arrow.png"} className="arrow" onClick={()=>{
                            if (pjCode > 0) {
                                pjCode--;
                            } else {
                                pjCode++;
                            }

                            query.set("pj", pjCode.toString());
                            setQuery(query);

                            SetProjectItem(
                                (<></>)
                            )

                            setTimeout(()=>{
                                Update();
                            }, 200);
                        }}></img>
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
            <div style={{
                textAlign: "center"
            }}>
                {projectItem}
            </div>
            <Modal isOpen={isModal} onRequestClose={CloseModal} style={{
                overlay: {
                    zIndex: 9,
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                },
                content: {
                    width: 1000,
                    height: 540,
                    margin: "auto",
                    zIndex: 10,
                    backgroundImage: `url(${modalImg})`,
                    backgroundSize: "100%",
                    backgroundColor: "#272727"
                }
            }}>
                 
            </Modal>
        </>
    )
}

export default Project;