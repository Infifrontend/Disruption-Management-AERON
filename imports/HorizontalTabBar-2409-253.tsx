function TabText() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-start justify-center px-6 py-0 relative shrink-0"
      data-name="Tab text"
    >
      <div className="font-['Poppins:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#141414] text-[18px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Tab 1</p>
      </div>
    </div>
  );
}

function Tab() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-center justify-center p-0 relative shrink-0"
      data-name="Tab"
    >
      <TabText />
      <div
        className="bg-[#133769] h-[3px] rounded-[500px] shrink-0 w-full"
        data-name="Active"
      />
    </div>
  );
}

function TabText1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-6 py-0 relative shrink-0"
      data-name="Tab text"
    >
      <div className="font-['Poppins:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#595959] text-[18px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Tab 2</p>
      </div>
    </div>
  );
}

function Tab1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 h-[47px] items-center justify-start p-0 relative shrink-0"
      data-name="Tab"
    >
      <TabText1 />
    </div>
  );
}

function TabText2() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-6 py-0 relative shrink-0"
      data-name="Tab text"
    >
      <div className="font-['Poppins:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#595959] text-[18px] text-center text-nowrap">
        <p className="block leading-[24px] whitespace-pre">Tab 3</p>
      </div>
    </div>
  );
}

function Tab2() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 h-[47px] items-center justify-start p-0 relative shrink-0"
      data-name="Tab"
    >
      <TabText2 />
    </div>
  );
}

export default function HorizontalTabBar() {
  return (
    <div
      className="bg-[#f0f0f0] relative rounded-tl-[4px] rounded-tr-[4px] size-full"
      data-name="Horizontal Tab bar"
    >
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start pb-0 pt-5 px-4 relative size-full">
          <Tab />
          <Tab1 />
          <Tab2 />
        </div>
      </div>
    </div>
  );
}