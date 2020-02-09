import { Injectable } from '@angular/core';
import { ApiClientService, Node } from './api-client.service';
import { Contract } from 'tsjs-xpx-dfms-api-http';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private _api_client: ApiClientService;

  private _contracts: Contract[] = [];
  private _selectedContract: Contract;
  private _selectedContractSubj = new BehaviorSubject<Contract>(this._selectedContract);
  private _roots: Map<string, Node> = new Map();
  private _cwd: Node = undefined;
  private _cwdSubj = new BehaviorSubject<Node>(this._cwd);
  private _cwdLs: Node[] = [];
  private _cwdLsSubj = new BehaviorSubject<Node[]>(this._cwdLs);

  constructor(api_client: ApiClientService) {
    this._api_client = api_client;

    this._api_client.stat.subscribe(node => {
      const path = node.pathComponents;
      if (! this._roots.has(path[0].cid)) {
        this._roots.set(path[0].cid, path[0]);
      }
      this.changeCwd();
    });

    this._api_client.ls.subscribe(children => {
      this._cwdLs = children;
      this._cwdLsSubj.next(this._cwdLs);
    });

    this._api_client.contracts.subscribe(contracts => {
      this._contracts = contracts;
      this._selectedContract = (this._contracts && this._contracts.length > 0 ? this._contracts[0] : undefined);
      this._selectedContractSubj.next(this._selectedContract);
      this._contracts.forEach(contract => {
        api_client.doStat(contract.drive, "/", undefined);
      });
      this.changeCwd();
    });
  }

  public changeCwd(newCwd?: Node) {
    if (this._selectedContract && this._roots.has(this._selectedContract.drive)) {
      if (! newCwd) {
        newCwd = this._roots.get(this._selectedContract.drive);
      }
      this._cwd = newCwd;
      this._cwdSubj.next(this._cwd);
      this._api_client.doLs(this._cwd.cid, this._cwd);
    }
  }

  public addFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    this._api_client.doAdd(this._cwd.cid, this._cwd, file.name, formData, false);
  }

  public addFolder(folderName: string, files: File[]) {
    const formData = new FormData();
    formData.append('file', new Blob([''], {
      type: 'application/x-directory'
    }), folderName);
    files.forEach(file => {
      formData.append('file', file, (file as any).webkitRelativePath ? (file as any).webkitRelativePath : folderName + '/' + file.name);
    });
    this._api_client.doAdd(this._cwd.cid, this._cwd, folderName, formData, false);
  }

  public deleteFile(node: Node) {
    this._api_client.doDelete(this._cwd.cid, node, false, false);
  }

  public createFolder(node: Node, name: string) {
    this._api_client.doMkdir(this._cwd.cid, name, node, false);
  }

  public rename(node: Node, name: string) {
    this._api_client.doRename(this._cwd.cid, node, name, false);
  }

  public copy(node: Node) {
    this._api_client.doCopy(this._cwd.cid, node, false);
  }

  public get(node: Node) {
    this._api_client.doGet(this._cwd.cid, node);
  }

  public get selectedContract() {
    return this._selectedContractSubj;
  }

  public get cwd() {
    return this._cwdSubj;
  }

  public get cwdLs() {
    return this._cwdLsSubj;
  }
}
