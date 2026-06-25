import svgPaths from "./svg-hcw6hd8h5m";
import imgEllipse105 from "./0e3db0f8521e705a254ed3863ebfe2f6bd840e0c.png";
import imgEllipse106 from "./240124fe223ba812d97a11e67d29dadcd4350447.png";
import imgEllipse107 from "./7d853a5644583c9cb88d358a81536fb595482693.png";
import imgEllipse108 from "./1f26be0f376da475a512f048f29c985b99f91b28.png";
import imgEllipse109 from "./642fc265b6e23f6da5ea4780b2ca1891dcba98ba.png";
import imgEllipse110 from "./520480c1111fb2291ee09750a2a8cd8f59aed0d6.png";
import imgEllipse113 from "./ce3f7a197622a1b9b5b3599e1666ae37030526c9.png";
import imgEllipse112 from "./74d0bd8029b593c592246da11e68e5ed577dedc1.png";
import imgRectangle1508 from "./e4666e1ed56344ad3a14f916e152d6b3da860f0b.png";
import imgRectangle1509 from "./f18d0704e40e70ec4c5b3d4754adbde024c25f25.png";
import imgRectangle1510 from "./d2b2ccdcb8fc4b27e831e5d5a5685a1d9368905f.png";
import imgRectangle1511 from "./6e1a5e1454d0d8637684a9d61bb14671c92828a9.png";
import imgRectangle1512 from "./87c4f995a573fbd201b305139ef6f80659d4ce1d.png";
import imgRectangle1513 from "./7c0d55ad6927a54da8f0bba8e4423bdfedda2b56.png";
import imgEllipse111 from "./1b9092d5c71a878bec6232d6b1b2519634f12ad6.png";
import { imgLo } from "./svg-pfmix";

function MaskGroup() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1" data-name="Mask Group">
      <div className="[word-break:break-word] col-1 flex flex-col font-['Gilroy:Bold',sans-serif] h-[62.335px] justify-center mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[1.075px_8.598px] mask-size-[42.99px_42.99px] ml-[-1.07px] mt-[-8.6px] not-italic relative row-1 text-[48px] text-white w-[55.887px]" style={{ maskImage: `url("${imgLo}")` }}>
        <p className="leading-[normal]">Lo</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
      <div className="[word-break:break-word] col-1 flex flex-col font-['Gilroy:Bold',sans-serif] h-[36.541px] justify-center ml-[59.11px] mt-[3.22px] not-italic relative row-1 text-[#555758] text-[28px] w-[69.858px]">
        <p className="leading-[normal]">Logo</p>
      </div>
      <div className="col-1 ml-0 mt-0 relative row-1 size-[42.99px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42.9898 42.9898">
          <circle cx="21.4949" cy="21.4949" fill="url(#paint0_linear_1_441)" id="Ellipse 102" r="21.4949" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_441" x1="0" x2="42.9898" y1="21.4949" y2="21.4949">
              <stop stopColor="#1D75DD" />
              <stop offset="1" stopColor="#085EC4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <MaskGroup />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Group1 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-white relative rounded-tl-[10px] shrink-0 w-full">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-center p-[20px] relative size-full">
          <Group />
        </div>
      </div>
    </div>
  );
}

function LayoutDashboard() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="layout-dashboard">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="layout-dashboard">
          <path d="M6.66667 2H2V8H6.66667V2Z" id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2H9.33333V5.33333H14V2Z" id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 8H9.33333V14H14V8Z" id="Vector_3" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3dcd6080} id="Vector_4" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <LayoutDashboard />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[78.456px]">
            <p className="leading-[normal]">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Archive() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="archive">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="archive">
          <path d={svgPaths.p2b09b200} id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <Archive />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[54.812px]">
            <p className="leading-[normal]">Product</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListOrdered() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="list-ordered">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="list-ordered">
          <path d="M6.66667 4H14" id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 8H14" id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 12H14" id="Vector_3" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.66667 4H3.33333V6.66667" id="Vector_4" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.66667 6.66667H4" id="Vector_5" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p22ba500} id="Vector_6" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <ListOrdered />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[40.84px]">
        <p className="leading-[normal]">Order</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[16.121px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.1212 16.1212">
          <circle cx="8.06058" cy="8.06058" fill="var(--fill-0, #FF353F)" id="Ellipse 104" r="8.06058" />
        </svg>
      </div>
      <div className="[word-break:break-word] col-1 flex flex-col font-['Gilroy:Regular',sans-serif] h-[9.673px] justify-center ml-[5.37px] mt-[3.22px] not-italic relative row-1 text-[8px] text-white w-[5.374px]">
        <p className="leading-[normal]">5</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] py-[15px] relative size-full">
          <Frame11 />
          <Group2 />
        </div>
      </div>
    </div>
  );
}

function MessageCircle() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="message-circle">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="message-circle">
          <path d={svgPaths.p97d5500} id="Vector" stroke="var(--stroke-0, #1D75DD)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <MessageCircle />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#1d75dd] text-[14px] w-[35.467px]">
            <p className="leading-[normal]">Chat</p>
          </div>
          <div className="absolute bg-[#1d75dd] h-[49px] left-0 top-0 w-[5.374px]" />
        </div>
      </div>
    </div>
  );
}

function FileText() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="file-text">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="file-text">
          <path d={svgPaths.pa3d9100} id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p32b7d180} id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.6667 8.66667H5.33333" id="Vector_3" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.6667 11.3333H5.33333" id="Vector_4" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.66667 6H5.33333" id="Vector_5" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <FileText />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[73.083px]">
            <p className="leading-[normal]">Document</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="settings">
          <path d={svgPaths.p5fbff00} id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p28db2b80} id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <Settings />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[50.513px]">
            <p className="leading-[normal]">Setting</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <Frame3 />
      <Frame1 />
      <Frame2 />
      <Frame4 />
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
      <Frame9 />
      <Frame12 />
    </div>
  );
}

function LogOut() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="log-out">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="log-out">
          <path d={svgPaths.p12257fa0} id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p2c1f680} id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 8H6" id="Vector_3" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[20px] py-[15px] relative size-full">
          <LogOut />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[17.196px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] w-[49.438px]">
            <p className="leading-[normal]">Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[768px] items-center justify-between left-0 overflow-clip rounded-bl-[10px] rounded-tl-[10px] top-0 w-[200px]">
      <Frame13 />
      <Frame7 />
    </div>
  );
}

function Frame48() {
  return (
    <div className="bg-[#a5ceff] content-stretch flex items-center justify-center overflow-clip px-[12px] py-[4px] relative rounded-[100px] shrink-0">
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d75dd] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">2 New</p>
      </div>
    </div>
  );
}

function Frame49() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0">
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] whitespace-nowrap">
        <p className="leading-[normal]">Inbox</p>
      </div>
      <Frame48 />
    </div>
  );
}

function Settings1() {
  return (
    <div className="relative shrink-0 size-[17.196px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1959 17.1959">
        <g id="settings">
          <path d={svgPaths.p21ceed00} id="Vector" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p380bef80} id="Vector_2" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame50() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[260px]">
      <Frame49 />
      <Settings1 />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[17.196px]" data-name="search">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1959 17.1959">
        <g id="search">
          <path d={svgPaths.p31582500} id="Vector" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p38a44c00} id="Vector_2" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame47() {
  return (
    <div className="bg-white content-stretch flex gap-[10px] items-start overflow-clip px-[20px] py-[10px] relative rounded-[100px] shrink-0 w-[260px]">
      <Search />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[14px] whitespace-nowrap">
        <p className="leading-[normal]">Search...</p>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Marvin McKinney</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Nursing Assistant</p>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse105} width="32.242" />
      </div>
      <Frame15 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame16 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame17 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[10px] w-full">
        <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="bg-white h-[93.242px] relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[15px] relative size-full">
          <Frame18 />
        </div>
      </div>
      <div aria-hidden className="absolute border-[#d1e6ff] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame40() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Jacob Jones</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Marketing Coordinator</p>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse106} width="32.242" />
      </div>
      <Frame40 />
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start justify-between min-w-px relative">
      <Frame41 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame43() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame42 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-start px-[20px] py-[15px] relative size-full">
          <Frame43 />
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[10px] whitespace-nowrap">
            <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
          </div>
          <div className="absolute left-[6px] size-[4.299px] top-[32px]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.29898 4.29898">
              <circle cx="2.14949" cy="2.14949" fill="var(--fill-0, #1D75DD)" id="Ellipse 106" r="2.14949" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-white whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Leslie Alexander</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Web Designer</p>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse107} width="32.242" />
      </div>
      <Frame35 />
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame36 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[8px] text-white whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame37 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-white w-full">
        <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  );
}

function Frame39() {
  return (
    <div className="bg-gradient-to-r from-[#1d75dd] relative shrink-0 to-[#085ec3] w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[15px] relative size-full">
          <Frame38 />
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Eleanor Pena</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Dog Trainer</p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse108} width="32.242" />
      </div>
      <Frame25 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame26 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame27 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[10px] w-full">
        <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  );
}

function Frame29() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[15px] relative size-full">
          <Frame28 />
        </div>
      </div>
      <div aria-hidden className="absolute border-[#d1e6ff] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame30() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Kathryn Murphy</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Medical Assistant</p>
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse109} width="32.242" />
      </div>
      <Frame30 />
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame31 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame32 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[10px] w-full">
        <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  );
}

function Frame34() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[15px] relative size-full">
          <Frame33 />
        </div>
      </div>
      <div aria-hidden className="absolute border-[#d1e6ff] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Frame20() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col justify-center relative shrink-0 text-[14px]">
        <p className="leading-[normal]">Wade Warren</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[8px]">
        <p className="leading-[normal]">Web Designer</p>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse110} width="32.242" />
      </div>
      <Frame20 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Frame21 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">5m</p>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame22 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[10px] w-full">
        <p className="leading-[normal]">Lorem ipsum dolor sit amet</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start px-[20px] py-[15px] relative size-full">
          <Frame23 />
        </div>
      </div>
    </div>
  );
}

function Frame46() {
  return (
    <div className="bg-white content-stretch flex flex-[1_0_0] flex-col gap-px items-start min-h-px overflow-clip relative rounded-[10px] w-[260px]">
      <Frame19 />
      <Frame45 />
      <Frame39 />
      <Frame29 />
      <Frame34 />
      <Frame24 />
    </div>
  );
}

function Frame52() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[668px] items-start left-[220px] top-[80px]">
      <Frame50 />
      <Frame47 />
      <Frame46 />
    </div>
  );
}

function Plus() {
  return (
    <div className="col-1 h-[17.067px] ml-0 mt-0 relative row-1 w-[16px]" data-name="plus">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17.0667">
        <g id="plus">
          <path d="M8 3.55556V13.5111" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.33333 8.53333H12.6667" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Group15() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
      <div className="[word-break:break-word] col-1 flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[17.067px] justify-center ml-[21px] mt-0 not-italic relative row-1 text-[14px] text-white w-[33px]">
        <p className="leading-[normal]">Chat</p>
      </div>
      <Plus />
    </div>
  );
}

function Group7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Group15 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-[#1d75dd] content-stretch flex flex-col h-[32px] items-center justify-center px-[23px] py-[7px] relative rounded-[5px] shrink-0">
      <Group7 />
    </div>
  );
}

function Bell() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="bell">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="bell">
          <path d={svgPaths.p1e4b7b80} id="Vector" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p146fda80} id="Vector_2" stroke="var(--stroke-0, #555758)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Frame8 />
      <Bell />
      <div className="relative shrink-0 size-[40px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="40" src={imgEllipse113} width="40" />
      </div>
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[14px] whitespace-nowrap">
        <p className="leading-[normal]">Leslie Alexander</p>
      </div>
    </div>
  );
}

function Frame51() {
  return (
    <div className="absolute content-stretch flex items-start justify-between left-[220px] top-[20px] w-[1126px]">
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[36.541px] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[28px] w-[69.858px]">
        <p className="leading-[normal]">Chat</p>
      </div>
      <Frame14 />
    </div>
  );
}

function Group17() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[107.474px]">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 107.474 107.474">
          <ellipse cx="53.7372" cy="53.7372" fill="var(--fill-0, #A5CEFF)" id="Ellipse 111" rx="53.7372" ry="53.7372" />
        </svg>
      </div>
      <div className="col-1 ml-[5.37px] mt-[5.37px] relative row-1 size-[96.727px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="96.727" src={imgEllipse112} width="96.727" />
      </div>
    </div>
  );
}

function Frame85() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col font-['Amazon_Ember:Regular',sans-serif] items-center leading-[0] not-italic relative shrink-0">
      <div className="flex flex-col h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[113.923px]">
        <p className="leading-[normal]">Leslie Alexander</p>
      </div>
      <div className="flex flex-col h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[55.887px]">
        <p className="leading-[normal]">Web Designer</p>
      </div>
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="col-1 ml-0 mt-0 relative row-1 size-[10.747px]">
        <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.2214 9.72115">
            <path d={svgPaths.p3cb29400} fill="var(--fill-0, #FF353F)" id="Star 1" />
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] col-1 flex flex-col font-['Gilroy:Regular',sans-serif] h-[7.523px] justify-center ml-[16.12px] mt-[2.15px] not-italic relative row-1 text-[#555758] text-[0px] w-[33.317px]">
        <p className="font-['Amazon_Ember:Regular',sans-serif] text-[6px]">
          <span className="leading-[normal] text-[#555758]">4.7</span>
          <span className="leading-[normal]">{` (Rating)`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <Group8 />
    </div>
  );
}

function Frame86() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0">
      <Frame85 />
      <Frame44 />
    </div>
  );
}

function Frame87() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0">
      <Group17 />
      <Frame86 />
    </div>
  );
}

function Frame71() {
  return (
    <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[0] not-italic relative shrink-0 w-[282px]">
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[88.129px]">
        <p className="leading-[normal]">Lorem ipsum</p>
      </div>
      <div className="flex flex-col font-['Gilroy:Regular',sans-serif] h-[12.897px] justify-center relative shrink-0 text-[#989ba1] text-[10px] w-[33.317px]">
        <p className="leading-[normal]">See all</p>
      </div>
    </div>
  );
}

function Frame72() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[66.634px]">
        <p className="leading-[normal]">Acme Co.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[36.541px]">
        <p className="leading-[normal]">Viet Nam</p>
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame72 />
    </div>
  );
}

function Frame78() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[230.773px]">
      <Group12 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[45.139px]">
        <p className="leading-[normal]">04:15 am</p>
      </div>
    </div>
  );
}

function Frame53() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1508} />
      </div>
      <Frame78 />
    </div>
  );
}

function Frame73() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[149.389px]">
        <p className="leading-[normal]">Biffco Enterprises Ltd.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[29.018px]">
        <p className="leading-[normal]">Greece</p>
      </div>
    </div>
  );
}

function Group11() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame73 />
    </div>
  );
}

function Frame79() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[220.529px]">
      <Group11 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[45.139px]">
        <p className="leading-[normal]">06:41 pm</p>
      </div>
    </div>
  );
}

function Frame54() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1509} />
      </div>
      <Frame79 />
    </div>
  );
}

function Frame74() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[79.531px]">
        <p className="leading-[normal]">Binford Ltd.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[48.363px]">
        <p className="leading-[normal]">South Africa</p>
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame74 />
    </div>
  );
}

function Frame80() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[186.745px]">
      <Group13 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[46.214px]">
        <p className="leading-[normal]">07:40 am</p>
      </div>
    </div>
  );
}

function Frame55() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1510} />
      </div>
      <Frame80 />
    </div>
  );
}

function Frame75() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[160.137px]">
        <p className="leading-[normal]">Big Kahuna Burger Ltd.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[70.933px]">
        <p className="leading-[normal]">Palestine, State of</p>
      </div>
    </div>
  );
}

function Group10() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame75 />
    </div>
  );
}

function Frame81() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[226.276px]">
      <Group10 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[45.139px]">
        <p className="leading-[normal]">01:34 pm</p>
      </div>
    </div>
  );
}

function Frame56() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1511} />
      </div>
      <Frame81 />
    </div>
  );
}

function Frame76() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[93.503px]">
        <p className="leading-[normal]">Abstergo Ltd.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[33.317px]">
        <p className="leading-[normal]">Monaco</p>
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame76 />
    </div>
  );
}

function Frame82() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[193.717px]">
      <Group9 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[46.214px]">
        <p className="leading-[normal]">02:34 am</p>
      </div>
    </div>
  );
}

function Frame57() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1512} />
      </div>
      <Frame82 />
    </div>
  );
}

function Frame77() {
  return (
    <div className="[word-break:break-word] col-1 content-stretch flex flex-col gap-[3px] items-start ml-0 mt-0 not-italic relative row-1">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] h-[18.271px] justify-center relative shrink-0 text-[#555758] text-[14px] w-[82.755px]">
        <p className="leading-[normal]">Barone LLC.</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center relative shrink-0 text-[#989ba1] text-[8px] w-[27.943px]">
        <p className="leading-[normal]">Kiribati</p>
      </div>
    </div>
  );
}

function Group14() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Frame77 />
    </div>
  );
}

function Frame83() {
  return (
    <div className="content-stretch flex items-center justify-between leading-[0] relative shrink-0 w-[187.969px]">
      <Group14 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[12.897px] justify-center not-italic relative shrink-0 text-[#555758] text-[10px] w-[46.214px]">
        <p className="leading-[normal]">05:49 pm</p>
      </div>
    </div>
  );
}

function Frame58() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full">
      <div className="relative rounded-[5px] shrink-0 size-[42.99px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[5px] size-full" src={imgRectangle1513} />
      </div>
      <Frame83 />
    </div>
  );
}

function Frame84() {
  return (
    <div className="content-stretch flex flex-col gap-[9px] items-end relative shrink-0 w-[282px]">
      <Frame53 />
      <div className="h-0 relative shrink-0 w-[231.07px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.07 1">
            <line id="Line 58" stroke="var(--stroke-0, #D1E6FF)" x2="231.07" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame54 />
      <div className="h-0 relative shrink-0 w-[231.07px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.07 1">
            <line id="Line 58" stroke="var(--stroke-0, #D1E6FF)" x2="231.07" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame55 />
      <div className="h-0 relative shrink-0 w-[231.07px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.07 1">
            <line id="Line 58" stroke="var(--stroke-0, #D1E6FF)" x2="231.07" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame56 />
      <div className="h-0 relative shrink-0 w-[231.07px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.07 1">
            <line id="Line 58" stroke="var(--stroke-0, #D1E6FF)" x2="231.07" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame57 />
      <div className="h-0 relative shrink-0 w-[231.07px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.07 1">
            <line id="Line 58" stroke="var(--stroke-0, #D1E6FF)" x2="231.07" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame58 />
    </div>
  );
}

function Frame88() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[20px] h-[668px] items-center left-[1024px] overflow-clip p-[20px] rounded-[10px] top-[80px]">
      <Frame87 />
      <Frame71 />
      <Frame84 />
    </div>
  );
}

function Frame61() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 text-[#989ba1] whitespace-nowrap">
      <div className="flex flex-col font-['Amazon_Ember:Bold',sans-serif] justify-center relative shrink-0 text-[16px]">
        <p className="leading-[normal]">Leslie Alexander</p>
      </div>
      <div className="flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center relative shrink-0 text-[12px]">
        <p className="leading-[normal]">Web Designer</p>
      </div>
    </div>
  );
}

function Frame60() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse107} width="32.242" />
      </div>
      <Frame61 />
    </div>
  );
}

function MoreVertical() {
  return (
    <div className="relative shrink-0 size-[25.794px]" data-name="more-vertical">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.7939 25.7939">
        <g id="more-vertical">
          <path d={svgPaths.p1cd8fc0} id="Vector" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p1f9c9540} id="Vector_2" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={svgPaths.p6760100} id="Vector_3" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame59() {
  return (
    <div className="bg-white content-stretch flex gap-[272px] items-center overflow-clip p-[20px] relative rounded-[10px] shrink-0 w-[504px]">
      <Frame60 />
      <MoreVertical />
    </div>
  );
}

function Frame62() {
  return (
    <div className="content-stretch flex gap-[17px] items-center relative shrink-0 w-full">
      <div className="bg-[#989ba1] flex-[1_0_0] h-[1.075px] min-w-px opacity-20 relative rounded-[10px]" />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">August 21</p>
      </div>
      <div className="bg-[#989ba1] flex-[1_0_0] h-[1.075px] min-w-px opacity-20 relative rounded-[10px]" />
    </div>
  );
}

function Frame65() {
  return (
    <div className="bg-white relative rounded-[5px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[8px] w-[376.16px]">
            <p className="leading-[14px]">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dolor mollis leo proin turpis eu hac. Tortor dolor eu at bibendum suspendisse. Feugiat mi eu, rhoncus diam consectetur libero morbi pharetra. Id tristique mi eget eget tristique orci.</p>
          </div>
        </div>
      </div>
      <div aria-hidden className="absolute border border-[#1d75dd] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

function Frame64() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-start min-w-px relative">
      <Frame65 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">10:15 pm</p>
      </div>
    </div>
  );
}

function Frame63() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse107} width="32.242" />
      </div>
      <Frame64 />
    </div>
  );
}

function Frame89() {
  return (
    <div className="bg-[#d1e6ff] relative rounded-[5px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#555758] text-[8px] w-[376.16px]">
            <p className="leading-[14px]">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dolor mollis leo proin turpis eu hac. Tortor dolor eu at bibendum suspendisse. `}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame67() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[5px] items-end min-w-px relative">
      <Frame89 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">12:15 pm</p>
      </div>
    </div>
  );
}

function Frame66() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full">
      <Frame67 />
      <div className="relative shrink-0 size-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="32.242" src={imgEllipse105} width="32.242" />
      </div>
    </div>
  );
}

function Frame90() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
      <div className="bg-[#989ba1] flex-[1_0_0] h-[1.075px] min-w-px opacity-20 relative rounded-[10px]" />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] h-[9.673px] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[8px] w-[38.691px]">
        <p className="leading-[normal]">August 22</p>
      </div>
      <div className="bg-[#989ba1] flex-[1_0_0] h-[1.075px] min-w-px opacity-20 relative rounded-[10px]" />
    </div>
  );
}

function Group4() {
  return (
    <div className="col-1 ml-[10.75px] mt-[12.9px] relative row-1 size-[26.869px]">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.8686 26.8686">
        <g id="Group 2358">
          <ellipse cx="13.4343" cy="13.4343" fill="var(--fill-0, #1D75DD)" id="Ellipse 110" rx="13.4343" ry="13.4343" />
          <path d={svgPaths.pd855140} fill="var(--fill-0, white)" id="Polygon 8" />
        </g>
      </svg>
    </div>
  );
}

function Xmlid1() {
  return (
    <div className="absolute inset-[0_50.59%_0_0]" data-name="XMLID_3_">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 87.6224 17.7333">
        <g id="XMLID_3_">
          <path d={svgPaths.p1cbeae80} fill="var(--fill-0, #1D75DD)" id="Vector" />
          <path d={svgPaths.p3729e780} fill="var(--fill-0, #1D75DD)" id="Vector_2" />
          <path d={svgPaths.pa922280} fill="var(--fill-0, #1D75DD)" id="Vector_3" />
          <path d={svgPaths.p359d3b80} fill="var(--fill-0, #1D75DD)" id="Vector_4" />
          <path d={svgPaths.p205c4700} fill="var(--fill-0, #1D75DD)" id="Vector_5" />
          <path d={svgPaths.p2883e500} fill="var(--fill-0, #1D75DD)" id="Vector_6" />
          <path d={svgPaths.p3d8d9880} fill="var(--fill-0, #1D75DD)" id="Vector_7" />
          <path d={svgPaths.pc1e7400} fill="var(--fill-0, #1D75DD)" id="Vector_8" />
          <path d={svgPaths.p1b43cf00} fill="var(--fill-0, #1D75DD)" id="Vector_9" />
          <path d={svgPaths.p2698f600} fill="var(--fill-0, #1D75DD)" id="Vector_10" />
          <path d={svgPaths.p1b60b440} fill="var(--fill-0, #1D75DD)" id="Vector_11" />
          <path d={svgPaths.p26b19300} fill="var(--fill-0, #1D75DD)" id="Vector_12" />
          <path d={svgPaths.p32cf6e80} fill="var(--fill-0, #1D75DD)" id="Vector_13" />
          <path d={svgPaths.p1dfb6080} fill="var(--fill-0, #1D75DD)" id="Vector_14" />
          <path d={svgPaths.p2b3f7300} fill="var(--fill-0, #1D75DD)" id="Vector_15" />
          <path d={svgPaths.p296bc200} fill="var(--fill-0, #1D75DD)" id="Vector_16" />
          <path d={svgPaths.p27142000} fill="var(--fill-0, #1D75DD)" id="Vector_17" />
          <path d={svgPaths.p84f9d00} fill="var(--fill-0, #1D75DD)" id="Vector_18" />
          <path d={svgPaths.p6661640} fill="var(--fill-0, #1D75DD)" id="Vector_19" />
          <path d={svgPaths.p31fae500} fill="var(--fill-0, #1D75DD)" id="Vector_20" />
          <path d={svgPaths.p3ea66100} fill="var(--fill-0, #1D75DD)" id="Vector_21" />
        </g>
      </svg>
    </div>
  );
}

function Xmlid() {
  return (
    <div className="absolute inset-[0_0_0_50.6%]" data-name="XMLID_2_">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 87.6103 17.7333">
        <g id="XMLID_2_">
          <path d={svgPaths.p5620a80} fill="var(--fill-0, #1D75DD)" id="Vector" />
          <path d={svgPaths.p1edc8000} fill="var(--fill-0, #1D75DD)" id="Vector_2" />
          <path d={svgPaths.p2d8c9e00} fill="var(--fill-0, #1D75DD)" id="Vector_3" />
          <path d={svgPaths.p16004e00} fill="var(--fill-0, #1D75DD)" id="Vector_4" />
          <path d={svgPaths.p2ab6f400} fill="var(--fill-0, #1D75DD)" id="Vector_5" />
          <path d={svgPaths.p85c3b00} fill="var(--fill-0, #1D75DD)" id="Vector_6" />
          <path d={svgPaths.p32e2a680} fill="var(--fill-0, #989BA1)" id="Vector_7" />
          <path d={svgPaths.p3962f500} fill="var(--fill-0, #989BA1)" id="Vector_8" />
          <path d={svgPaths.p85d8980} fill="var(--fill-0, #989BA1)" id="Vector_9" />
          <path d={svgPaths.p3d27b000} fill="var(--fill-0, #989BA1)" id="Vector_10" />
          <path d={svgPaths.p2a082ef0} fill="var(--fill-0, #989BA1)" id="Vector_11" />
          <path d={svgPaths.pe867b80} fill="var(--fill-0, #989BA1)" id="Vector_12" />
          <path d={svgPaths.p2a5cd840} fill="var(--fill-0, #989BA1)" id="Vector_13" />
          <path d={svgPaths.p19c876f2} fill="var(--fill-0, #989BA1)" id="Vector_14" />
          <path d={svgPaths.p34ba4840} fill="var(--fill-0, #989BA1)" id="Vector_15" />
          <path d={svgPaths.p30805800} fill="var(--fill-0, #989BA1)" id="Vector_16" />
          <path d={svgPaths.p3d732df0} fill="var(--fill-0, #989BA1)" id="Vector_17" />
          <path d={svgPaths.p4f9d700} fill="var(--fill-0, #989BA1)" id="Vector_18" />
          <path d={svgPaths.p2d159300} fill="var(--fill-0, #989BA1)" id="Vector_19" />
          <path d={svgPaths.p132c1e00} fill="var(--fill-0, #989BA1)" id="Vector_20" />
          <path d={svgPaths.p280cf2c0} fill="var(--fill-0, #989BA1)" id="Vector_21" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="col-1 h-[17.733px] ml-0 mt-0 overflow-clip relative row-1 w-[177.333px]" data-name="Frame">
      <Xmlid1 />
      <Xmlid />
    </div>
  );
}

function Group3() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
      <Frame />
    </div>
  );
}

function Group5() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[48.36px] mt-[10.75px] place-items-start relative row-1">
      <div className="[word-break:break-word] col-1 flex flex-col font-['Gilroy:Regular',sans-serif] h-[9.673px] justify-center ml-0 mt-[20.42px] not-italic relative row-1 text-[#1d75dd] text-[8px] w-[17.196px]">
        <p className="leading-[normal]">0:56</p>
      </div>
      <Group3 />
    </div>
  );
}

function Group16() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <div className="bg-[#a5ceff] col-1 h-[51.588px] ml-0 mt-0 relative rounded-bl-[100px] rounded-tl-[100px] row-1 w-[161.212px]" />
      <Group4 />
      <Group5 />
      <div className="border border-[#1d75dd] border-solid col-1 h-[51.588px] ml-0 mt-0 relative rounded-[100px] row-1 w-[250.415px]" />
    </div>
  );
}

function Frame92() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start leading-[0] relative shrink-0">
      <Group16 />
      <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center not-italic relative shrink-0 text-[#989ba1] text-[8px] whitespace-nowrap">
        <p className="leading-[normal]">06:00 pm</p>
      </div>
    </div>
  );
}

function Frame91() {
  return (
    <div className="content-stretch flex gap-[10px] items-start relative shrink-0">
      <div className="h-[30.84px] relative shrink-0 w-[32.242px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="30.84" src={imgEllipse111} width="32.242" />
      </div>
      <Frame92 />
    </div>
  );
}

function Frame68() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
      <Frame62 />
      <Frame63 />
      <Frame66 />
      <Frame90 />
      <Frame91 />
    </div>
  );
}

function Paperclip() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="paperclip">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="paperclip">
          <path d={svgPaths.p2949300} id="Vector" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Smile() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="smile">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_375)" id="smile">
          <path d={svgPaths.p39ee6532} id="Vector" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p30be9df0} id="Vector_2" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 6H6.00433" id="Vector_3" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 6H10.0057" id="Vector_4" stroke="var(--stroke-0, #989BA1)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_1_375">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Send() {
  return (
    <div className="col-1 ml-[3.2px] mt-[4px] relative row-1 size-[12.8px]" data-name="send">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.8 12.8">
        <g clipPath="url(#clip0_1_348)" id="send">
          <path d={svgPaths.p368a880} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p321dfef0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_1_348">
            <rect fill="white" height="12.8" width="12.8" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <div className="bg-[#1d75dd] col-1 ml-0 mt-0 relative rounded-[2px] row-1 size-[20px]" />
      <Send />
    </div>
  );
}

function Frame94() {
  return (
    <div className="content-stretch flex gap-[11px] items-center relative shrink-0">
      <Paperclip />
      <Smile />
      <Group6 />
    </div>
  );
}

function Frame93() {
  return (
    <div className="bg-white relative rounded-[3px] shrink-0 w-full">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[10px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Amazon_Ember:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#989ba1] text-[13px] whitespace-nowrap">
            <p className="leading-[normal]">Write a message...</p>
          </div>
          <Frame94 />
        </div>
      </div>
      <div aria-hidden className="absolute border border-[#ddd] border-solid inset-0 pointer-events-none rounded-[3px]" />
    </div>
  );
}

function Frame69() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative rounded-[10px] w-[504px]">
      <div className="flex flex-col justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
          <Frame68 />
          <Frame93 />
        </div>
      </div>
    </div>
  );
}

function Frame70() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[668px] items-start left-[500px] top-[80px]">
      <Frame59 />
      <Frame69 />
    </div>
  );
}

export default function ChatUiLight() {
  return (
    <div className="bg-[#d1e6ff] relative rounded-[10px] size-full" data-name="Chat Ui Light">
      <Frame10 />
      <Frame52 />
      <div className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Gilroy:Regular',sans-serif] h-[13.972px] justify-center leading-[0] left-[637.32px] not-italic text-[#989ba1] text-[8px] top-[330.48px] w-0">
        <p className="leading-[normal]">{` `}</p>
      </div>
      <div className="absolute bg-white h-[51.588px] left-[576.06px] rounded-[100px] top-[479.34px] w-[250.415px]" />
      <Frame51 />
      <Frame88 />
      <Frame70 />
    </div>
  );
}