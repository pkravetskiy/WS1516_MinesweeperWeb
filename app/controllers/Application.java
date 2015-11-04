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
	private IController controller = minesweeper.getTui().getController();
  public Result index() {
  	// String str = controller.getFieldHTML();
		// System.out.println(str);
  	// Html text = new Html(str);
    return ok(views.html.index.render("Minesweeper", controller));
  }

  public Result commandline(String command) {
  	minesweeper.getTui().processInputLine(command);
		if (controller.isVictory()) {
			command = "Victory!";
		} else if (controller.isGameOver()) {
			command = "Game Over!";
		} else {
			command = "You typed: " + command;
		}
  	return ok(views.html.index.render(command, controller));
  }

	public Result about() {
		return ok(views.html.about.render());
	}
}
