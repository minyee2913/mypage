import { useEffect, useState } from "react";
import { Pj, PrCategory } from "./dataStructure";
import "./style.css";
import { useSearchParams } from "react-router-dom";
import { useInterval } from "../API";
import Modal from "react-modal";
import { CopyToClipboard } from "react-copy-to-clipboard";

PrCategory.data = [];

PrCategory.$("minecraft", "마인크래프트 개발", "img/minecraft.png")
    .Projects(
        Pj.$("luminous", "Luminous RPG")
            .Platform("MCBE SERVER")
            .Images("img/games/luminous/lumi0.gif", "img/games/luminous/lumi1.png", "img/games/luminous/lumi2.png")
            .Description("2020년부터 개발 중인 마인크래프트 BE 서버 기반의 액션, 스토리, RPG, 반오픈월드 프로젝트.")
            .Docs("https://luminous-rpg.notion.site/146ab655c564453c8ce716dc37aabda6")
            .Video("https://youtu.be/noaMwGSlYFY?si=EQtuC2ofYlXHsWvw"),
        Pj.$("valorant", "Valorant Addon")
            .Platform("MCBE ADDON")
            .Description("마인크래프트에서 발로란트의 캐릭터와 총기 시스템을 구현한 마인크래프트 BE 애드온 프로젝트.")
            .Github("https://github.com/minyee2913/valorant-addon")
            .Video("https://youtu.be/27_Dz3ObTzc"),
        Pj.$("video-particle", "Video Particle")
            .Platform("STANDALONE PROGRAM")
            .Description("영상 파일 데이터를 추출해서 마인크래프트 내 파티클로 영상을 그대로 구현하고 재생하는 별도 프로그램."),
        Pj.$("blockbeat", "Block Beat")
            .Platform("MCBE MAP")
            .Description("키 입력이 아닌 마우스로 에임을 돌려 노트를 치는 마인크래프트 BE 맵 기반 리듬게임.")
            .Video("https://youtu.be/ndHBnaODyos?si=-V5IA7Lzn82Enl7G"),
    );

PrCategory.$("unity", "게임 개발", "img/unity.png")
    .Projects(
        Pj.$("ignotus", "IGNOTUS")
            .Platform("Mobile")
            .Images("img/games/ignotus/1.jpg", "img/games/ignotus/2.jpg", "img/games/ignotus/3.jpg")
            .Description("실시간 전투에 타일 시스템을 넣어 턴제 전투 요소를 섞은 모바일 로그라이크 액션 게임.")
            .Video("https://youtu.be/knDdXG--Q_w?si=aSHezL5cWePz2cQK"),
        Pj.$("survival-strategy", "생존 전략!")
            .Platform("PC")
            .Description("모션 그래픽을 이용한 스토리 전개와 플레이어의 행동이 다음 회차 스탯에 반영되는 액션 게임.")
            .Github("https://github.com/minyee2913/survival_strategy")
            .Video("https://youtu.be/qY3b2b_TLA0"),
        Pj.$("albedo", "Albedo")
            .Platform("PC")
            .Images("img/games/albedo/1.png", "img/games/albedo/2.png", "img/games/albedo/3.png")
            .Description("빛 효과로 스타일을 강조하고, 플레이어가 직접 스킬을 쓰지 않고 다른 주체에게 맡기는 방식으로 전투가 진행되는 탈출 액션 게임.")
            .Video("https://youtu.be/eC4HczYUfWA")
            .Download("https://github.com/sunrinton2025/amazing_something/releases/download/dd/albedo.zip"),
        Pj.$("koroshite", "KOROSHITE")
            .Platform("PC")
            .Images("img/games/koroshite/koro0.png", "img/games/koroshite/koro1.png", "img/games/koroshite/koro2.png")
            .Description("서로 다른 스킬을 가진 캐릭터로 8인 대전과 보스전을 즐길 수 있는 PC 액션 게임.")
            .Docs("https://heady-whitefish-4a4.notion.site/KOROSHITE-9ff743039ac14d0d82d8bc23cca036e7?pvs=4")
            .Github("https://github.com/minyee2913/koroshite")
            .Video("https://youtu.be/Q3kyJ8awLgo?si=BF6WCymrgMlv2S9o")
            .Download("https://github.com/minyee2913/koroshite/releases/download/0.0.0.final.boss/Koro.zip"),
        Pj.$("hunger-of-war", "Hunger Of War")
            .Platform("PC")
            .Description("마을 자체가 플레이어가 되어 다른 플레이어에게서 식량을 빼앗고 주민을 생존시키는 멀티플레이 생존 게임."),
        Pj.$("isekai-button", "버튼을 눌렀더니 판타지 게임속 주인공이 되어버린 건에 대하여")
            .Platform("PC")
            .Description("이전 회차 플레이어의 행동이 그림자가 되어 다음 플레이에 영향을 주는 다회차 기반 로그라이크 액션 게임.")
            .Video("https://youtu.be/XC09-MKsyCw"),
        Pj.$("deliver-homez", "구해줘 홈즈 김배달의 우당탕탕 대모험")
            .Platform("PC")
            .Description("점프 버튼 대신 마우스 드래그로 캐릭터를 던지는 방식으로 진행되는 아케이드 플랫포머 게임.")
            .Video("https://youtu.be/KInJwl4cEj0"),
        Pj.$("echo", "ECHO")
            .Platform("PC")
            .Description("집에 들어온 NPC들이 벌이는 돌발 행동을 아이템으로 막아내는 아케이드 시뮬레이션 전략 게임."),
        Pj.$("bumgeun-rush", "범근러쉬")
            .Platform("PC")
            .Description("학교 친구를 등장인물로 내세운 엽기적인 감성의 러닝 아케이드 게임."),
        Pj.$("escape-the-music", "ESCAPE THE MUSIC")
            .Platform("PC")
            .Description("노트 상호작용에 따라 뒤의 플랫포머 캐릭터가 반응하는 구조의 플랫포머 리듬 게임.")
            .Github("https://github.com/zerOpen-is-on-RG/escape_the_music")
            .Video("https://youtu.be/hjJWSH370Qw"),
        Pj.$("eucliwood", "유클리우드 Edge")
            .Platform("PC")
            .Description("전투마다 두더지 잡기 같은 퍼즐을 진행하고, 퍼즐 성취도에 따른 버프를 받은 뒤 실시간 전투가 이어지는 퍼즐 액션 로그라이크.")
            .Video("https://youtu.be/qeY9_LM9LVc?si=74Ngadrt-ges73ge"),
        Pj.$("farmer-happy-life", "파머의 해피 라이프")
            .Platform("PC")
            .Description("오염되어 가는 타일을 빠르게 이동하며 중화시켜 땅을 지키는 아케이드 퍼즐 게임.")
            .Video("https://youtu.be/TaHivs_WtP8?si=7QDLd0qb6IpfMDti"),
    );

function Project() {
    const [projectItem, SetProjectItem] = useState<JSX.Element>();
    const [categoryItem, SetCategoryItem] = useState<JSX.Element[]>([]);
    const [modalImg, setImg] = useState("");
    const [isModal, SetModal] = useState(false);
    const [imgPage, SetImagePage] = useState(1);

    let category = "minecraft";
    let pjCode = 0;

    const [query, setQuery ] = useSearchParams();
    const section = query.get("sec");
    const project = query.get("pj");

    if (section) {
        category = section;
    }

    const pn = Number(project);

    if (!isNaN(pn)) {
        pjCode = pn;
    } else {
        const sect = PrCategory.data.find((v)=>v.id === category);
        if (sect) {
            const f = sect.projects.find((v)=>v.id === project);

            if (f) {
                pjCode = sect.projects.indexOf(f);
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
    };

    useInterval(()=>{
        SetImagePage((imgPage+1) % 3);
        Update();
    }, 8000);

    const OpenModal = ()=>{
        SetModal(true);
    };

    const CloseModal = ()=>{
        SetModal(false);
    };

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
        };

        const sect = PrCategory.data.find((v)=>v.id === category);
        if (sect) {
            const currentProject = sect.projects[pjCode];
            const projectImages = currentProject.img.filter(Boolean);
            const shareSection = section ?? category;

            SetProjectItem(
                (
                    <div className={"project_sec"}>
                        <p className="title">{currentProject.name}</p>
                        <p className="platform">{currentProject.platform}</p>
                        {projectImages.length >= 3 ? (
                            <>
                                <img src={projectImages[0]} className={imgPage % 3 == 1 ? "imgNow" : imgPage % 3 == 2 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                                    OnClickImg(r.currentTarget);
                                }}></img>
                                <img src={projectImages[projectImages.length - 1]} className={imgPage % 3 == 2 ? "imgNow" : imgPage % 3 == 0 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                                    OnClickImg(r.currentTarget);
                                }}></img>
                                <img src={projectImages[1]} className={imgPage % 3 == 0 ? "imgNow" : imgPage % 3 == 1 ? "imgAfter" : "imgBefore"} onClick={(r)=>{
                                    OnClickImg(r.currentTarget);
                                }}></img>
                            </>
                        ) : projectImages.length > 0 ? (
                            <img src={projectImages[0]} className="imgNow" onClick={(r)=>{
                                OnClickImg(r.currentTarget);
                            }}></img>
                        ) : <></>}
                        <div className="buttons">
                            {currentProject.docs ? <a href={currentProject.docs} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="기획 / 문서">
                                <img src="img/docs.png"></img>
                            </a> : <></>}
                            {currentProject.youtube ? <a href={currentProject.youtube} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="플레이 영상">
                                <img src="img/youtube.png"></img>
                            </a> : <></>}
                            {currentProject.github ? <a href={currentProject.github} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="GitHub">
                                <img src="img/github.png"></img>
                            </a> : <></>}
                            {currentProject.download ? <a href={currentProject.download} target="_blank" rel="noreferrer" className="btn hovertext pointer" data-hover="다운로드">
                                <img src="img/download.png"></img>
                            </a> : <></>}
                        </div>
                        <CopyToClipboard text={`https://human.minyee2913.net/project?pj=${currentProject.id}&sec=${shareSection}`} onCopy={()=>{alert("클립보드에 복사되었습니다.")}}>
                            <div className="share_btn hovertext pointer" data-hover="공유">
                                    <img src="img/import.png"></img>
                            </div>
                        </CopyToClipboard>
                        <p className="descrip">{currentProject.description}</p>
                        {pjCode+1 < sect.projects.length && pjCode > 0 ? (<img id='ar2' src="img/down_arrow.png" className="arrow" onClick={()=>{
                            pjCode++;

                            query.set("pj", pjCode.toString());
                            setQuery(query);

                            SetProjectItem(
                                (<></>)
                            );

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
                            );

                            setTimeout(()=>{
                                Update();
                            }, 200);
                        }}></img>
                    </div>
                )
            );
        } else {
            SetProjectItem(
                (<></>)
            );
        }
        SetCategoryItem(itms);
    };

    useEffect(()=>{
        Update();
    }, []);

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
                    width: "80vw",
                    height: "40vw",
                    margin: "auto",
                    zIndex: 10,
                    backgroundImage: `url(${modalImg})`,
                    backgroundSize: "100%",
                    backgroundColor: "#272727"
                }
            }}>
            </Modal>
        </>
    );
}

export default Project;
