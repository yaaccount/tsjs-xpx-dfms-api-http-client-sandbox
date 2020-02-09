import { Injectable } from '@angular/core';
import { ContractClientHttp, DriveFsHttp, Stat } from 'tsjs-xpx-dfms-api-http';
import { Contract } from 'tsjs-xpx-dfms-api-http';
import { BehaviorSubject, Subject } from 'rxjs';

const streamSaver = require('streamsaver');

export class Node {
  constructor(
    public cid: string,
    public stat: Stat,
    public parent: Node,
  ) {}

  public get pathComponents() {
    const path: Node[] = [this];
    let parent = this.parent;
    while (parent) {
      path.unshift(parent);
      parent = parent.parent;
    }
    return path;
  }

  public get path() {
    const p = this.pathComponents;
    if (p.length > 0) {
      return p[0].stat.name + p.slice(1).map(n => n.stat.name).join("/");
    } else {
      return "";
    }
  }
}

@Injectable({
  providedIn: 'root'
})

export class ApiClientService {
  // private url = "http://127.0.0.1:6366/api/v1";
  // private url = "http://localhost:6366/api/v1";
  // private url = "http://localhost:4200/api/v1"; // proxied with proxy.conf.js
  private url = "http://localhost/api/v1"; // 6366 behind nginx proxy :80/api/v1 -> :6366/api/v1
  // private url = "http://testnet1.so.xpxsirius.io:6466/api/v1";

  private configuration = {
      basePath: this.url
  };
  private contractClientHttp = new ContractClientHttp(this.configuration);
  private driveFsHttp = new DriveFsHttp(this.configuration);
  private _contracts: Contract[] = [];
  private _contractsSubj = new BehaviorSubject<Contract[]>(this._contracts);
  private _lsSubj = new Subject<Node[]>();
  private _statSubj = new Subject<Node>();

  constructor() {
    this.init();
  }

  private init() {
    this.contractClientHttp.ls().subscribe(contracts => {
      this._contracts = contracts;
      this._contractsSubj.next(this._contracts);
    });
  }

  public doStat(cid: string, path: string, parent: Node) {
    this.driveFsHttp.stat(cid, path).subscribe(stat => this._statSubj.next(new Node(cid, stat, parent)));
  }

  public doLs(cid: string, node: Node) {
    this.driveFsHttp.ls(cid, node.path).subscribe(stats => this._lsSubj.next(stats.map(stat => new Node(cid, stat, node))));
  }

  public doAdd(cid: string, parent: Node, name: string, body: any, flush=true) {
    this.driveFsHttp.add(cid, parent.path + "/" + name, body, flush).subscribe(() => {
      this.doLs(cid, parent);
    });
  }

  public doDelete(cid: string, node: Node, flush=true, local=true) {
    this.driveFsHttp.rm(cid, node.path, flush, local).subscribe(() => {
      this.doLs(cid, node.parent);
    })
  }

  public doMkdir(cid: string, name, parent: Node, flush=true) {
    const path = parent.path + "/" + name;
    this.driveFsHttp.mkDir(cid, path, flush).subscribe(() => {
      this.doLs(cid, parent);
    })
  }

  public doRename(cid: string, node: Node, newName: string, flush=true) {
    this.driveFsHttp.mv(cid, node.path, node.parent.path + "/" + newName, flush).subscribe(() => {
      this.doLs(cid, node.parent);
    });
  }

  public doCopy(cid: string, node: Node, flush=true) {
    this.driveFsHttp.cp(cid, node.path, node.path + " (copy)", flush).subscribe(() => {
      this.doLs(cid, node.parent);
    });
  }

  public doGet(cid, node: Node, flush=true) {
    this.driveFsHttp.getAsResponse(cid, node.path, flush).subscribe(response => {
      const fileStream = streamSaver.createWriteStream(node.stat.name + '.tar', {
        // size: 22, // (optional) Will show progress
        // writableStrategy: undefined, // (optional)
        // readableStrategy: undefined  // (optional)
      });

      response.body.pipeTo(fileStream);
    });
  }

  public get contracts() {
    return this._contractsSubj;
  }

  public get ls() {
    return this._lsSubj;
  }

  public get stat() {
    return this._statSubj;
  }
}
