package controllers;

import play.data.Form;
import play.mvc.Controller;
import play.mvc.Result;
import play.twirl.api.Html;
import de.htwg.se.minesweeper.Minesweeper;
import de.htwg.se.aview.gui.PlayingFieldPanel;
import de.htwg.se.controller.IController;
import de.htwg.se.model.IField;
import de.htwg.se.model.impl.Field;
import de.htwg.se.util.observer.Event;
import de.htwg.se.util.observer.IObserver;
import views.html.*;

public class Application extends Controller {
	private Minesweeper minesweeper = Minesweeper.getInstance();

  public Result index() {
  	String str = minesweeper.getTui().getField();
		System.out.println(str);
  	Html text = new Html(str);
      return ok(views.html.index.render("Minesweeper", text));
  }

  public Result commandline(String command) {
  	minesweeper.getTui().processInputLine(command);

  	String str = minesweeper.getTui().getField();
  	Html text = new Html(str);
  	return ok(views.html.index.render(command, text));
  }

	public Result about() {
		return ok(views.html.about.render());
	}
}
