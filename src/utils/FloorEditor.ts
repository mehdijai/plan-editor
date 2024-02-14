import { PaperScope, Path, Point, Tool, Size, Color, PointText } from "paper";
import { EventEmitter } from "./EventModule";
import { getAssetPath } from "./assets";
import { createId } from "@paralleldrive/cuid2";

export interface TableSchema {
  ref: string;
  id: string;
  chairs: number;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
}

interface SVGTables {
  src: string;
  chairsCount: number;
}

export class FloorEditor {
  private paper: paper.PaperScope;
  private importedSchema: TableSchema[] = [];
  private schema: TableSchema[] = [];
  private eventEmitter: EventEmitter;
  private floorTilesColor = new Color("#F5F5F5");
  private floorTilesStroke = new Color("#E8E8E8");

  private tablesSVGs: SVGTables[] = [
    {
      src: getAssetPath("tables/table-2.svg"),
      chairsCount: 2,
    },
    {
      src: getAssetPath("tables/table-4.svg"),
      chairsCount: 4,
    },
    {
      src: getAssetPath("tables/table-6.svg"),
      chairsCount: 6,
    },
  ];

  private tablesLayer: paper.Layer;
  private bgLayer: paper.Layer;

  constructor(canvas: HTMLCanvasElement) {
    this.paper = new PaperScope();
    this.paper.setup(canvas);
    this.eventEmitter = new EventEmitter();
    this.bgLayer = new this.paper.Layer();
    this.tablesLayer = new this.paper.Layer();
    this.initiateLayers();
    this.eventsWatcher();
  }

  private initiateLayers() {
    if (!this.bgLayer) this.bgLayer = new this.paper.Layer();
    this.bgLayer.name = "bg";
    this.paper.project.addLayer(this.bgLayer);
    this.drawPlanGrid();
    if (!this.tablesLayer) this.tablesLayer = new this.paper.Layer();
    this.tablesLayer.name = "floor-plan";
    this.paper.project.addLayer(this.tablesLayer);
    this.tablesLayer.activate();
  }

  isDirty() {
    return JSON.stringify(this.importedSchema) !== JSON.stringify(this.schema);
  }

  private updateSelectedTablePosition() {
    if (!this.selectedTable) return;
    const table = this.schema.find((el) => el.ref === this.getTableRef(this.selectedTable?.name));
    if (!table) return;
    table.position.x = this.selectedTable.position.x;
    table.position.y = this.selectedTable.position.y;
    table.rotation = this.selectedTable.rotation;

    this.eventEmitter.emit("isDirty", this.isDirty());
  }

  private eventsWatcher() {
    const tool = new Tool();

    tool.onMouseDown = (event: paper.MouseEvent) => {
      const hitResult = this.paper.project.hitTest(event.point, {
        fill: true,
        tolerance: 5,
      });

      if (this.selectedTable) {
        this.selectedTable.selected = false;
        this.selectedTable.bounds.selected = false;
      }

      if (!hitResult) {
        this.eventEmitter.emit("isClicked", null);
        return;
      }

      const parentGroup = hitResult.item.parent?.parent;

      if (parentGroup instanceof this.paper.Group) {
        parentGroup.bounds.selected = true;
        this.selectedTable = parentGroup;
        this.lastMousePosition = event.point;
        this.isDragging = true;

        if (event.modifiers.shift) {
          this.selectedTable.rotate(45);
          this.updateSelectedTablePosition();
        }

        if (this.selectedTable) {
          this.eventEmitter.emit("isClicked", this.getTableRef(this.selectedTable.name));
        }
      } else {
        this.eventEmitter.emit("isClicked", null);
      }
    };

    tool.onMouseDrag = (event: paper.MouseEvent) => {
      if (this.isDragging && this.selectedTable && this.lastMousePosition) {
        const delta = event.point.subtract(this.lastMousePosition);

        this.selectedTable.position = this.selectedTable.position.add(delta);
        this.lastMousePosition = event.point;

        this.updateSelectedTablePosition();
      }
    };

    tool.onKeyUp = (event: paper.KeyEvent) => {
      if (event.key == "delete" && this.selectedTable) {
        this.removeSelectedTable();
      }
    };

    tool.onMouseUp = () => {
      this.isDragging = false;
      this.lastMousePosition = undefined;
      if (this.selectedTable) {
        // this.selectedTable.bounds.selected = false;
        // this.selectedTable = undefined;
      }
    };
  }

  private drawPlanGrid() {
    const canvasSize = this.paper.view.size;
    const rectSize = new Size(canvasSize.width, canvasSize.height);

    new Path.Rectangle({
      point: new Point(0, 0),
      size: rectSize,
      fillColor: this.floorTilesColor,
    }).addTo(this.bgLayer);

    const hGridSize = canvasSize.height / 10;
    const vGridSize = canvasSize.width / 10;
    const gridColor = this.floorTilesStroke;
    for (let x = 0; x <= this.paper.view.size.width; x += vGridSize) {
      const verticalLine = new Path.Line(
        new Point(x, 0),
        new Point(x, this.paper.view.size.height),
      ).addTo(this.bgLayer);
      verticalLine.strokeColor = gridColor;
      verticalLine.locked = true;
    }

    for (let y = 0; y <= this.paper.view.size.height; y += hGridSize) {
      const horizontalLine = new Path.Line(
        new Point(0, y),
        new Point(this.paper.view.size.width, y),
      ).addTo(this.bgLayer);
      horizontalLine.strokeColor = gridColor;
      horizontalLine.locked = true;
    }
  }

  private addTableIdElements(table: paper.Group) {
    const center = table.bounds.center;
    const text = new PointText({
      point: center,
      content: this.getTableRef(table.name),
      fillColor: "black",
      fontFamily: "Inter",
      fontWeight: "bold",
      fontSize: 18,
      justification: "center",
    }).addTo(table);

    text.applyMatrix = false;

    text.locked = true;
    text.name = "table-id-" + this.getTableRef(table.name);

    text.position.y += text.bounds.height / 2 - 4;
    text.rotate(table.rotation);

    const padding = 10;
    const rectangleSize = new this.paper.Size(
      text.bounds.width + padding * 2,
      text.bounds.height + padding * 2,
    );
    const rectanglePosition = center.subtract(rectangleSize.divide(2));

    // @ts-ignore
    const rect = new Path.RoundRectangle({
      rectangle: new this.paper.Rectangle(rectanglePosition, rectangleSize),
      radius: 12,
      fillColor: "#F5F5F5",
    }).addTo(table);

    rect.applyMatrix = false;

    rect.name = "id-wrapper-" + this.getTableRef(table.name);
    rect.rotate(table.rotation);

    rect.locked = true;

    text.bringToFront();
  }

  private getTableRef(name?: string) {
    return name?.replace("table-item-", "");
  }

  private drawTables() {
    return new Promise<TableSchema[]>((resolve) => {
      this.tablesLayer.removeChildren();

      this.schema.forEach((item) => {
        const src = this.tablesSVGs.find((el) => el.chairsCount == item.chairs)?.src;
        if (!src) return;
        this.tablesLayer.importSVG(src, {
          onLoad: (importedItem: paper.Group) => {
            importedItem.position.x = item.position.x;
            importedItem.position.y = item.position.y;
            importedItem.name = "table-item-" + item.ref;
            importedItem.data.type = "table";
            importedItem.data.chairs = item.chairs;
            this.addTableIdElements(importedItem);
            importedItem.applyMatrix = false;
            importedItem.rotation = item.rotation;

            importedItem.addTo(this.tablesLayer);
          },
        });
      });
      resolve(this.schema);
    });
  }

  insertTable(chairsCount: number, offsetX: number, offsetY: number) {
    const tableSvg = this.tablesSVGs.find((el) => el.chairsCount === chairsCount);

    if (!tableSvg) return;

    this.schema.push({
      ref: this.generateRef(),
      chairs: chairsCount,
      position: {
        x: offsetX,
        y: offsetY,
      },
      rotation: 0,
      id: createId(),
    });

    this.eventEmitter.emit("isDirty", this.isDirty());

    return this.drawTables();
  }

  private selectedTable: paper.Group | undefined;
  private isDragging = false;
  private lastMousePosition: paper.Point | undefined;

  removeSelectedTable() {
    if (this.selectedTable) {
      this.selectedTable.remove();
      this.schema = this.schema.filter(
        (el) => el.ref !== this.getTableRef(this.selectedTable?.name),
      );
      this.eventEmitter.emit("Deleted", this.getTableRef(this.selectedTable.name));
      this.selectedTable = undefined;
      this.eventEmitter.emit("isDirty", this.isDirty());
    }
  }

  updateRef(oldRef: string, newRef: string) {
    const match = this.tablesLayer.children.find((item) => this.getTableRef(item.name) === oldRef);
    if (!match) return;
    // Update Content
    const textElement = match.children.find((child) => child instanceof PointText);
    if (textElement && textElement instanceof PointText) {
      textElement.content = newRef;
      textElement.name = "table-id-" + newRef;

      const textItemWrapper = match.children.find(
        (child) => child instanceof Path && child.name.startsWith("id-wrapper-"),
      );

      if (textItemWrapper) {
        const padding = 10;
        const newTextSize = new this.paper.Size(
          textElement.bounds.width + padding * 2,
          textElement.bounds.height + padding * 2,
        );
        const sizeDelta = newTextSize.width - textItemWrapper.bounds.width;
        textItemWrapper.bounds.size = newTextSize;
        textItemWrapper.position.x -= sizeDelta / 2;
        textItemWrapper.name = "id-wrapper-" + newRef;
      }
    }
    // Update in schema
    const schemaMatch = this.schema.find((el) => el.ref === oldRef);

    if (schemaMatch) {
      schemaMatch.ref = newRef;
    }
    // Update name
    match.name = "table-item-" + newRef;
    this.drawTables();
    this.eventEmitter.emit("isDirty", this.isDirty());
  }

  exportPlan() {
    const plan = this.exportSVG().toString();
    const schema = this.schema;

    return { plan, schema };
  }

  exportSVG() {
    const svg = this.paper.project.exportSVG({
      matchShapes: true,
    });

    if (svg instanceof SVGElement) {
      const styleTag = document.createElementNS("http://www.w3.org/2000/svg", "style");
      styleTag.innerHTML = `
        #bg > * {
          pointer-events: none;
        }
        .table-item {
          cursor: pointer;
        }
        .table-item:hover > g > path {
          stroke: transparent;
        }
        .table-item:hover > .id-wrapper {
          fill: #E8E8E8;
        }
        .table-item:hover > .id-wrapper.dine-in {
          fill: #D9E7F7;
        }
        .table-item:hover > .id-wrapper.reserved {
          fill: #FDECEC;
        }
        .id-wrapper {
          fill: #F5F5F5;
        }
        .id-wrapper.dine-in {
          fill: #9ABEEA;
        }
        .id-wrapper.reserved {
          fill: #F8B8B9;
        }
        text {
          -webkit-touch-callout: none;
          -webkit-user-select:none;
          -khtml-user-select:none;
          -moz-user-select:none;
          -ms-user-select:none;
          -o-user-select:none;
          user-select:none;
          }
        `;

      const tableItems = svg.querySelectorAll("g[id*='table-item-']");
      tableItems.forEach((element) => {
        element.classList.add("table-item");
      });
      const idWrappers = svg.querySelectorAll("rect[id*='id-wrapper-']");
      idWrappers.forEach((element) => {
        element.classList.add("id-wrapper");
      });

      svg.prepend(styleTag);
      return svg.outerHTML;
    } else {
      return svg;
    }
  }

  importFloor(schemaString: string) {
    this.clear();

    this.bgLayer.remove();
    this.tablesLayer.remove();

    this.initiateLayers();

    this.schema = JSON.parse(schemaString);
    this.importedSchema = JSON.parse(schemaString);

    this.drawTables();

    return this.schema;
  }

  private clear() {
    this.bgLayer.removeChildren();
    this.tablesLayer.removeChildren();
    this.schema.slice();
    this.selectedTable = undefined;
  }

  // Misc
  generateRef(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const rndIndex = Math.floor(Math.random() * (letters.length - 1 - 0 + 1) + 0);
    const rndNb = Math.floor(Math.random() * (9 - 0 + 1) + 0);

    const ref = letters[rndIndex] + rndNb;
    if (this.schema.find((el) => el.ref === ref)) {
      return this.generateRef();
    }

    return ref;
  }

  // Events

  onIsClicked(listener: (ref: string | null) => void) {
    this.eventEmitter.on("isClicked", listener);
  }

  offIsClicked() {
    this.eventEmitter.off("isClicked", () => {});
  }

  onIsDirty(listener: (value: boolean) => void) {
    this.eventEmitter.on("isDirty", listener);
  }

  offIsDirty() {
    this.eventEmitter.off("isDirty", () => {});
  }

  onDeleted(listener: (ref: string | null) => void) {
    this.eventEmitter.on("Deleted", listener);
  }

  offDeleted() {
    this.eventEmitter.off("Deleted", () => {});
  }
}

