import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Contract } from 'tsjs-xpx-dfms-api-http';
import { Node } from 'src/app/services/api-client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('file') file;
  @ViewChild('folder') folder;
  public newName: string;
  public renameShown = -1;

  private _dataService: DataService;

  public contract: Contract = undefined;
  public cwd: Node = undefined;
  public cwdLs: Node[] = [];

  constructor(dataService: DataService) {
    this._dataService = dataService;

    this._dataService.selectedContract.subscribe(contract => {
      this.contract = contract;
    });

    this._dataService.cwd.subscribe(node => {
      this.cwd = node;
    });

    this._dataService.children.subscribe(nodes => {
      this.cwdLs = nodes.sort((a, b) => {
        if (a.stat.type === b.stat.type) {
          if (a.stat.name > b.stat.name) return 1;
          if (a.stat.name < b.stat.name) return -1;
          return 0;
        } else {
          if (a.stat.type > b.stat.type) return -1;
          if (a.stat.type < b.stat.type) return 1;
          return 0;
        }
      });
    });
  }

  ngOnInit() {
  }

  onCd(node: Node) {
    this._dataService.changeCwd(node);
    this.clearRenaming();
  }

  onDelete(node: Node) {
    this._dataService.deleteFile(node);
    this.clearRenaming();
  }

  onMkdir(node: Node, name: string) {
    this._dataService.createFolder(node, name);
    this.clearRenaming();
  }

  onRename(node: Node, name: string) {
    this._dataService.rename(node, name);
    this.clearRenaming();
  }

  onCopy(node: Node) {
    this._dataService.copy(node);
    this.clearRenaming()
  }

  onGet(node: Node) {
    this._dataService.get(node);
  }

  onFolderAdded() {
    const files: { [key: string]: File } = this.folder.nativeElement.files;
    this.clearRenaming();
    this.addFolder(files);
    this.folder.nativeElement.value = "";
  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    this.clearRenaming();
    this.addFiles(files);
    this.file.nativeElement.value = "";
  }

  private clearRenaming() {
    this.newName = "";
    this.renameShown = -1;
  }

  private addFiles(files:  { [key: string]: File }) {
    const fileList = [] as File[];
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        fileList.push(files[key]);
      }
    }
    fileList.forEach(file => {
      console.log(((file as any).webkitRelativePath ? (file as any).webkitRelativePath : file.name) + " (" + file.size + ")");
    });
    fileList.forEach(file => {
      this._dataService.addFile(file);
    });
  }

  private addFolder(files: { [key: string]: File }) {
    const fileList = [] as File[];
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        fileList.push(files[key]);
      }
    }
    let folderName = undefined;
    fileList.forEach(file => {
      console.log(((file as any).webkitRelativePath ? (file as any).webkitRelativePath : file.name) + " (" + file.size + ")");
      if (! folderName && (file as any).webkitRelativePath) {
        const pathComponents = (file as any).webkitRelativePath.split('/');
        if (pathComponents.length > 0) {
          folderName = pathComponents[0];
        }
      }
    });
    this._dataService.addFolder(folderName, fileList);
  }
}
