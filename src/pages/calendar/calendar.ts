import { Network } from 'ionic-native';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { UserStorageService } from '../../providers/database/user-storage-service';
import { DateUtil } from '../../providers/util/date-util';
import { CalendarEventEditPage } from './new-event/edit-event/edit-event';
import { CalendarStorageService } from '../../providers/database/calendar-storage-service';



@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html'
})

export class CalendarPage {
   events : any;
   listSchedule : any;
   allSechedule : any;
   showCalendar : any;
   verifyNetwork: any = true;

   loading : any

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public calendarStorageService: CalendarStorageService,
    public userStorageService : UserStorageService,
    public dateUtil: DateUtil,
    public alertCtrl: AlertController) {

  }

  ionViewWillEnter() {
    this._verifyIfHaveConnect();
    this._generateAllSchedule();
  }

  ionViewWillLeave() {
    this._generateAllSchedule();
    this.updateDate(new Date());
  }

  removeEvent(event, userUid) {
    let alert = this.alertCtrl.create({
      title: "Deseja remover",
      message: "Você deseja mesmo remover o evento " + event.message,
      buttons: [
        {
          text: 'Sim',
          handler: data => {
            this.listSchedule.then((schedule) => {
              this.calendarStorageService.removeEvent(schedule.user.$key, event);
              this._generateAllSchedule();
              this.updateDate(new Date());
            });
          }
        },
        {
          text: 'Não'
        }
      ]
    });

    alert.present();
  }

  updateDate($event) {
    this.listSchedule = this._generateSchedule($event, this.userStorageService, this.calendarStorageService, this.dateUtil);
  }

  editEvent(event) {
    this.navCtrl.push(CalendarEventEditPage, {datas: event});
  }

  _verifyIfHaveConnect() {
    Network.onDisconnect().subscribe(() => {
      this.verifyNetwork = false
    });
  }

  _generateAllSchedule() {
    this.showCalendar = false;
     this._generateSchedule(new Date(), this.userStorageService, this.calendarStorageService, this.dateUtil).then((schedule : any) => {
       this.allSechedule = schedule.events;
       this.showCalendar = true;
     });
  }

  _generateSchedule(dateNow, userStorageService, calendarStorageService, dateUtil) {
    return new Promise((resolve) => {
      Promise.resolve(dateNow)
      .then(getUser)
      .then(getEvents)
      .then(verifyIfEventSelected)
      .then(resolvePromise)

      function getUser(dateNow) {
        return userStorageService.getUser().then((user : any) => {
          let wrapper = { user : user, dateNow: dateNow }
          return wrapper;
        });
      }

      function getEvents(wrapper) {
        return calendarStorageService.getEvents(wrapper.user.$key).then((events : any) => {
          wrapper.events = events;
          return wrapper;
        });
      }

      function verifyIfEventSelected(wrapper) {
         wrapper.eventsSelected = wrapper.events.filter((event) => {
          if(dateUtil.removeTime(dateNow) >= dateUtil.removeTime(event.start_at) &&
          dateUtil.removeTime(dateNow) <= dateUtil.removeTime(event.end_at)) {
            return true;
          } else {
            return false;
          }
        });

        return wrapper;
      }

      function resolvePromise(wrapper) {
        resolve(wrapper);
      }
    })
  }

}
