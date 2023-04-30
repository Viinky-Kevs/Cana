import { Component, OnInit } from '@angular/core';
import { navbarData, navbarGit } from './navData';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  navData = navbarData;
  navGit = navbarGit;
  screenWidth = 0;

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }
}
